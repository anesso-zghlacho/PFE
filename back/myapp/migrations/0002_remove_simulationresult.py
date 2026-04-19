# Generated migration to remove SimulationResult model

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='SimulationResult',
        ),
    ]
