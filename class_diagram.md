# Network Intrusion Detection System (NIDS) - UML Class Diagram

This document presents a comprehensive UML Class Diagram representing the architecture of the **Sentinel Flow NIDS** backend. The system is designed with a decoupled architecture, separating database persistence, machine learning inference, real-time packet capturing, and event notifications.

---

## 1. Class Diagram (Mermaid)

The diagram below details the classes, attributes, methods, and relationships of the system.

```mermaid
classDiagram
    %% Django Database Models
    class TrafficLog {
        +int id
        +String src_ip
        +String dst_ip
        +int src_port
        +int dst_port
        +String protocol
        +int packet_size
        +String tcp_flags
        +float duration
        +int packet_count
        +int byte_count
        +float bytes_per_packet
        +float packets_per_sec
        +int syn_count
        +int ack_count
        +int fin_count
        +String predicted_label
        +float confidence_score
        +JSON features
        +DateTime timestamp
        +__str__() String
    }

    class Alert {
        +int id
        +String title
        +String description
        +String severity
        +String source_ip
        +float prediction_score
        +DateTime timestamp
        +TrafficLog traffic_log
        +boolean is_resolved
        +__str__() String
    }

    class AccessLog {
        +int id
        +User user
        +String action
        +String ip_address
        +DateTime timestamp
        +__str__() String
    }

    class User {
        +int id
        +String username
        +String email
        +boolean is_staff
    }

    %% Notification Subsystem
    class NotificationService {
        <<interface>>
        +notify(title, description, severity)* void
    }

    class ConsoleNotificationService {
        +notify(title, description, severity) void
    }

    class SlackNotificationService {
        +String webhook_url
        +notify(title, description, severity) void
    }

    %% ML Inference Pipeline
    class InferenceResult {
        <<dataclass>>
        +String label
        +float score
        +Dict features
    }

    class BaseModel {
        <<interface>>
        +load(model_path)* void
        +predict(features)* InferenceResult
        +metadata()* Dict
    }

    class RandomForestModel {
        +Any model
        +boolean loaded
        +List~String~ feature_order
        +load(model_path) void
        +predict(features) InferenceResult
        +metadata() Dict
        -_vectorize(features) np.ndarray
    }

    class BinaryAnomalyClassifierRF {
        +load(model_path) void
        +predict(features) InferenceResult
    }

    class PortscanClassifierRF {
        +load(model_path) void
        +predict(features) InferenceResult
    }

    class SynFloodClassifierRF {
        +load(model_path) void
        +predict(features) InferenceResult
    }

    class DDoSClassifierRF {
        +load(model_path) void
        +predict(features) InferenceResult
    }

    class BotnetClassifierRF {
        +load(model_path) void
        +predict(features) InferenceResult
    }

    class HierarchicalIDSClassifier {
        +Any scaler
        +BinaryAnomalyClassifierRF binary_model
        +SynFloodClassifierRF synflood_model
        +BotnetClassifierRF botnet_model
        +DDoSClassifierRF ddos_model
        +PortscanClassifierRF portscan_model
        +boolean loaded
        +List~String~ feature_columns
        +load(model_dir) void
        +predict(features) InferenceResult
        +metadata() Dict
    }

    class InferenceEngine {
        +BaseModel model
        +analyze_packet(packet) InferenceResult
        +analyze_stream(packets) Iterator~InferenceResult~
    }

    class PacketAnalysisService {
        +InferenceEngine engine
        +NotificationService notification_service
        +analyze_and_store(packet) Tuple
        +bulk_analyze_and_store(packets) int
        -_severity_from_score(score) String
    }

    %% Sniffing & Queueing Engine
    class SnifferManager {
        <<singleton>>
        -SnifferManager _instance$
        -Lock _lock$
        -Thread _thread
        -Thread _consumer_thread
        -Event _stop_event
        -boolean _is_running
        -String _interface
        +Queue packet_queue
        +PacketAnalysisService service
        +start(interface) Tuple
        +stop() Tuple
        +status() Dict
        -_init_manager() void
    }

    %% Relationships
    Alert "0..*" --> "0..1" TrafficLog : references
    AccessLog "0..*" --> "1" User : logs action of
    BaseModel <|-- RandomForestModel : implements
    BaseModel <|-- HierarchicalIDSClassifier : implements
    RandomForestModel <|-- BinaryAnomalyClassifierRF : extends
    RandomForestModel <|-- PortscanClassifierRF : extends
    RandomForestModel <|-- SynFloodClassifierRF : extends
    RandomForestModel <|-- DDoSClassifierRF : extends
    RandomForestModel <|-- BotnetClassifierRF : extends
    HierarchicalIDSClassifier *-- BinaryAnomalyClassifierRF : composes
    HierarchicalIDSClassifier *-- SynFloodClassifierRF : composes
    HierarchicalIDSClassifier *-- BotnetClassifierRF : composes
    HierarchicalIDSClassifier *-- DDoSClassifierRF : composes
    HierarchicalIDSClassifier *-- PortscanClassifierRF : composes
    InferenceEngine --> BaseModel : uses
    PacketAnalysisService --> InferenceEngine : uses
    PacketAnalysisService --> NotificationService : uses
    NotificationService <|-- ConsoleNotificationService : implements
    NotificationService <|-- SlackNotificationService : implements
    SnifferManager --> PacketAnalysisService : uses
    SnifferManager ..> TrafficLog : creates
    SnifferManager ..> Alert : creates
```

---

## 2. Component Breakdowns

### A. Django Database Models
*   **TrafficLog**: Represents detailed statistical features extracted from captured packets. Fields include networking parameters (IPs, ports, protocols, size, TCP flags) and classification results (predicted label and confidence score).
*   **Alert**: Generated when the ML Inference Engine classifies a packet as an attack. Features a foreign key association to the corresponding `TrafficLog` to retain full forensic context.
*   **AccessLog**: Records authentication attempts (`LOGIN`/`LOGOUT`) by system `User`s for audit logging and Role-Based Access Control (RBAC) security purposes.

### B. Machine Learning (ML) Inference Pipeline
*   **BaseModel**: An abstract base class defining the uniform contract for all model wrappers (`load`, `predict`, and `metadata`).
*   **RandomForestModel**: Concrete adapter wrapping the scikit-learn Random Forest model, managing data vectorization and prediction logic.
*   **HierarchicalIDSClassifier**: Composite classifier managing the two-tier inference logic using the scaler and individual specialized models.
*   **The 5 Random Forest Classifiers**: Specialized instances of the Random Forest model used for hierarchical classification:
    *   `BinaryAnomalyClassifierRF`: Decides if a packet is Normal or Intrusion.
    *   `PortscanClassifierRF`: Classifies Portscan intrusion signatures.
    *   `SynFloodClassifierRF`: Classifies SYN Flood DDoS signatures.
    *   `DDoSClassifierRF`: Classifies general DDoS traffic anomalies.
    *   `BotnetClassifierRF`: Classifies Botnet communication signatures.
*   **InferenceEngine**: Bridges feature extraction and model prediction by converting raw packet packets to normalized features and feeding them to the active model.
*   **PacketAnalysisService**: Orchestrates the workflow: passes incoming packets to the `InferenceEngine`, saves the resulting `TrafficLog` and `Alert` records, and dispatches external notifications if an attack is identified.

### C. Notification Subsystem
*   **NotificationService**: Interface declaring the unified `notify` method.
*   **ConsoleNotificationService**: Standard local logger sending severe security events directly to the logs/console.
*   **SlackNotificationService**: Remote hook dispatching critical alert payloads directly to a dedicated Slack security channel.

### D. Sniffing & Queueing Engine
*   **SnifferManager**: A Singleton class implementing a thread-safe producer-consumer model:
    1.  **Producer (Scapy thread)**: Sniffs packets on the network interface and pushes them to a thread-safe `Queue`.
    2.  **Consumer (Worker thread)**: Dequeues packets in batches (default: 50 packets) and passes them to `PacketAnalysisService.bulk_analyze_and_store` to guarantee high-performance, low-latency database insertions.
