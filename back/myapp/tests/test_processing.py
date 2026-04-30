from django.test import TestCase, Client
from django.urls import reverse

from myapp.processing.extractor import extract_packet_features
from myapp.processing.model_wrappers import MockModel


class FeatureExtractionTests(TestCase):
    def test_extract_packet_features_returns_required_keys(self):
        packet = {
            'src_ip': '192.168.1.2',
            'dst_ip': '10.0.0.1',
            'src_port': 1234,
            'dst_port': 80,
            'protocol': 6,
            'packet_size': 512,
            'tcp_flags': ['SYN', 'ACK'],
            'timestamp': 1672531200.0,
        }

        features = extract_packet_features(packet)

        self.assertEqual(features['src_ip'], '192.168.1.2')
        self.assertEqual(features['dst_ip'], '10.0.0.1')
        self.assertEqual(features['packet_size'], 512)
        self.assertEqual(features['protocol'], 6)
        self.assertEqual(features['tcp_flags'], 'ACK,SYN')
        self.assertEqual(features['timestamp'], 1672531200.0)


class MockModelTests(TestCase):
    def test_mock_model_predicts_attack_or_normal(self):
        model = MockModel()
        model.load('unused')

        packet = {
            'packet_size': 1500,
            'tcp_flags': 'SYN',
        }
        features = extract_packet_features({
            'src_ip': '10.0.0.1',
            'dst_ip': '192.168.1.10',
            'src_port': 1234,
            'dst_port': 443,
            'protocol': 6,
            'packet_size': 1500,
            'tcp_flags': 'SYN',
            'timestamp': 1672531200.0,
        })

        result = model.predict(features)

        self.assertIn(result.label, ['normal', 'attack'])
        self.assertGreaterEqual(result.score, 0.0)
        self.assertLessEqual(result.score, 1.0)
        self.assertEqual(result.features['src_ip'], '10.0.0.1')


class PacketIngestionTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('api_packet_ingest')

    def test_packet_ingest_endpoint_creates_traffic_log_and_response(self):
        payload = {
            'src_ip': '10.0.0.5',
            'dst_ip': '192.168.64.5',
            'src_port': 12345,
            'dst_port': 80,
            'protocol': 6,
            'packet_size': 900,
            'tcp_flags': 'SYN',
        }

        response = self.client.post(self.url, payload, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('prediction', response.json())
        self.assertIn('traffic_log_id', response.json())
        self.assertIsNone(response.json()['alert_id'])
