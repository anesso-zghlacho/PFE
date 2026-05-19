from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            "DROP TABLE IF EXISTS auth_group_permissions;",
            "CREATE TABLE auth_group_permissions (id integer NOT NULL PRIMARY KEY AUTOINCREMENT, group_id integer NOT NULL REFERENCES auth_group(id), permission_id integer NOT NULL REFERENCES auth_permission(id));"
        ),
        migrations.RunSQL(
            "DROP TABLE IF EXISTS auth_group;",
            "CREATE TABLE auth_group (id integer NOT NULL PRIMARY KEY AUTOINCREMENT, name varchar(150) NOT NULL UNIQUE);"
        ),
        migrations.RunSQL(
            "DROP TABLE IF EXISTS auth_user_groups;",
            "CREATE TABLE auth_user_groups (id integer NOT NULL PRIMARY KEY AUTOINCREMENT, user_id integer NOT NULL REFERENCES auth_user(id), group_id integer NOT NULL REFERENCES auth_group(id));"
        ),
        migrations.RunSQL(
            "DROP TABLE IF EXISTS auth_user_user_permissions;",
            "CREATE TABLE auth_user_user_permissions (id integer NOT NULL PRIMARY KEY AUTOINCREMENT, user_id integer NOT NULL REFERENCES auth_user(id), permission_id integer NOT NULL REFERENCES auth_permission(id));"
        ),
        migrations.RunSQL(
            "DROP TABLE IF EXISTS django_admin_log;",
            "CREATE TABLE django_admin_log (id integer NOT NULL PRIMARY KEY AUTOINCREMENT, object_id text, object_repr varchar(200) NOT NULL, action_flag smallint unsigned NOT NULL CHECK (action_flag >= 0), change_message text NOT NULL, content_type_id integer REFERENCES django_content_type(id), user_id integer NOT NULL REFERENCES auth_user(id), action_time datetime NOT NULL);"
        ),
    ]
