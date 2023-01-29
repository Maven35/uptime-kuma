const { faTableTennis } = require("@fortawesome/free-solid-svg-icons");
const e = require("express");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('setting', function(table) {
        table.increments('id');
        table.string('key', 200).notNullable();
        table.string('value', 200);
        table.string('type', 20);

        table.unique('key')
    }).then(() =>
        knex.schema.createTable('user', function(table) {
            table.increments('id');
            table.string('username', 255).notNullable();
            table.string('password', 255);
            table.boolean('active').notNullable().defaultTo(true);
            table.string('timezone', 150);
            table.string('twofa_secret', 64);
            table.boolean('twofa_status').notNullable().defaultTo(false);
            table.string('twofa_last_token', 6);

            table.unique('username');
        })
    ).then(() =>
        knex.schema.createTable('notification', function(table) {
            table.increments('id');
            table.string('name', 255).notNullable();
            table.text('config');
            table.boolean('active').notNullable().defaultTo(true);
            table.integer('user_id', 10).unsigned().references('user.id').onUpdate('CASCADE').onDelete('SET NULL');
            table.boolean('is_default').notNullable().defaultTo(false);
        })
    ).then(() =>
        knex.schema.createTable('monitor', function(table) {
            table.increments('id');
            table.string('name', 150).notNullable();
            table.integer('user_id', 10).unsigned().references('user.id').onUpdate('CASCADE').onDelete('SET NULL');
            table.datetime('created_date').notNullable().defaultTo(knex.fn.now());

            table.boolean('active').notNullable().defaultTo(true);
            table.integer('interval').notNullable().defaultTo(20);
            table.string('type', 20);
            table.string('url');
            table.string('hostname', 255);
            table.integer('port');

            table.integer('weight').defaultTo(2000);
            table.string('keyword', 255);

            table.boolean('ignore_tls').notNullable().defaultTo(false);
            table.boolean('upside_down').notNullable().defaultTo(false);
            table.integer('maxretries').notNullable().defaultTo(0);
            table.integer('maxredirects').notNullable().defaultTo(10);
            table.string('accepted_statuscodes_json').notNullable().defaultTo('["200-299"]');

            table.string('dns_resolve_type', 5);
            table.string('dns_resolve_server', 255);
            table.string('dns_last_result', 255);

            table.integer('retry_interval').notNullable().defaultTo(0);
            table.string('push_token', 20);

            table.string('method').notNullable().defaultTo('GET');
            table.text('body');
            table.text('headers');
            table.string('basic_auth_user');
            table.string('basic_auth_pass');

            table.integer('docker_host').references('docker_host.id');
            table.string('docker_container', 255);

            table.string('game', 255);

            table.string('auth_method', 250);
            table.text('auth_domain');
            table.text('auth_workstation');

            table.string('radius_username', 255);
            table.string('radius_password', 255);
            table.string('radius_calling_station_id', 50);
            table.string('radius_called_station_id', 50);
            table.string('radius_secret', 255);

            table.integer('retry_interval').defaultTo(0).notNullable();
            table.string('database_connection_string', 2000);
            table.text('database_query');

            table.text('mqtt_topic');
            table.string('mqtt_success_message', 255);
            table.string('mqtt_username', 255);
            table.string('mqtt_password', 255);

            table.string('grpc_url', 255).defaultTo(null);
            table.text('grpc_protobuf').defaultTo(null);
            table.text('grpc_body').defaultTo(null);
            table.text('grpc_metadata').defaultTo(null);
            table.string('grpc_method', 255).defaultTo(null);
            table.string('grpc_service_name', 255).defaultTo(null);
            table.boolean('grpc_enable_tls').defaultTo(0).notNullable();

            table.index(['user_id']);
        })
    ).then(() =>
        knex.schema.createTable('incident', function(table) {
            table.increments('id');
            table.string('title', 255).notNullable();
            table.string('content');
            table.string('style', 30).notNullable().defaultTo('warning');
            table.datetime('created_date').notNullable().defaultTo(knex.fn.now());
            table.datetime('last_updated_date');
            table.boolean('pin').notNullable().defaultTo(true);
            table.boolean('active').notNullable().defaultTo(true);
        })
    ).then(() =>
        knex.schema.createTable('group', function(table) {
            table.increments('id');
            table.string('name', 255).notNullable();
            table.datetime('created_date').notNullable().defaultTo(knex.fn.now());

            table.boolean('public').notNullable().defaultTo(false);
            table.boolean('active').notNullable().defaultTo(true);
            table.integer('weight').notNullable().defaultTo(1000);
        })
    ).then(() =>
        knex.schema.createTable('tag', function(table) {
            table.increments('id');
            table.string('name', 255).notNullable();
            table.string('color', 255).notNullable();
            table.datetime('created_date').notNullable().defaultTo(knex.fn.now());
        })
    ).then(() =>
        knex.schema.createTable('monitor_tls_info', function(table) {
            table.increments('id');
            table.integer('monitor_id', 10).unsigned().notNullable().references('monitor.id').onUpdate('CASCADE').onDelete('CASCADE');
            table.text('info_json');
        })
    ).then(() =>
        knex.schema.createTable('notification_sent_history', function(table) {
            table.increments('id');
            table.string('type', 50);
            table.integer('monitor_id', 10).unsigned().notNullable().references('monitor.id').onUpdate('CASCADE').onDelete('CASCADE');
            table.integer('days').notNullable();

            table.unique(['type', 'monitor_id', 'days']);
        })
    ).then(() =>
        knex.schema.createTable('heartbeat', function(table) {
            table.increments('id');
            table.boolean('important').notNullable().defaultTo(false);
            table.integer('monitor_id', 10).unsigned().notNullable().references('monitor.id').onUpdate('CASCADE').onDelete('CASCADE');
            table.integer('status').notNullable();
            table.text('msg');
            table.datetime('time').notNullable();
            table.integer('ping');
            table.integer('duration').notNullable().defaultTo(0);

            table.index(['monitor_id', 'time'], 'monitor_time_index');
            table.index(['monitor_id', 'important', 'time'], 'monitor_important_time_index');
            table.index(['monitor_id']);
            table.index(['important']);
        })
    ).then(() =>
        knex.schema.createTable('monitor_notification', function(table) {
            table.increments('id');
            table.integer('monitor_id', 10).unsigned().notNullable().references('monitor.id').onUpdate('CASCADE').onDelete('CASCADE');
            table.integer('notification_id', 10).unsigned().notNullable().references('notification.id').onUpdate('CASCADE').onDelete('CASCADE');

            table.index(['monitor_id', 'notification_id']);
        })
    ).then(() =>
        knex.schema.createTable('monitor_group', function(table) {
            table.increments('id');
            table.integer('monitor_id', 10).unsigned().notNullable().references('monitor.id').onUpdate('CASCADE').onDelete('CASCADE');
            table.integer('group_id', 10).unsigned().notNullable().references('group.id').onUpdate('CASCADE').onDelete('CASCADE');
            table.integer('weight').notNullable().defaultTo(1000);
            table.boolean('send_url').notNullable().defaultTo(0);

            table.index(['monitor_id', 'group_id']);
        })
    ).then(() =>
        knex.schema.createTable('monitor_tag', function(table) {
            table.increments('id');
            table.integer('monitor_id', 10).unsigned().notNullable().references('monitor.id').onUpdate('CASCADE').onDelete('CASCADE');
            table.integer('tag_id', 10).unsigned().notNullable().references('tag.id').onUpdate('CASCADE').onDelete('CASCADE');
            table.string('value');

            table.index(['monitor_id']);
            table.index(['tag_id']);
        })
    ).then(() =>
        knex.schema.createTable('docker_host', function(table) {
            table.increments('id');
            table.integer('user_id', 10).notNullable();
            table.string('docker_daemon', 255);
            table.string('docker_type', 255);
            table.string('name', 255);

        })
    ).then(() =>
        knex.schema.createTable('maintenance', function(table) {
            table.increments('id').notNullable();
            table.string('title', 150).notNullable();
            table.text('description').notNullable();
            table.integer('user_id').references('user.id').onDelete('SET NULL').onUpdate('CASCADE');
            table.boolean('active').notNullable().defaultTo(1);
            table.string('strategy', 50).notNullable().defaultTo('single');
            table.dateTime('start_date');
            table.dateTime('end_date');
            table.time('start_time');
            table.time('end_time');
            table.string('weekdays', 250).defaultTo('[]');
            table.text('days_of_month').defaultTo('[]');
            table.integer('interval_day');
            table.index(['strategy','active'],'manual_active');
            table.index(['active'], 'active');
            table.index(['user_id'], 'maintenance_user_id');
        })
    ).then(() =>
        knex.schema.createTable('maintenance_status_page', function(table) {
            table.increments('id').notNullable();
            table.integer('status_page_id').notNullable();
            table.integer('maintenance_id').notNullable();
            table.foreign('maintenance_id',['FK_maintenance']).references('maintenance.id').onDelete('CASCADE').onUpdate('CASCADE');
            table.foreign('status_page_id',['FK_status_page']).references('status_page.id').onDelete('CASCADE').onUpdate('CASCADE');
            table.index(['maintenance_id'], 'maintenance_id_index');
            table.index(['status_page_id'], 'status_page_id_index');

        })
    ).then(() =>
        knex.schema.createTable('maintenance_timeslot', function(table) {
            table.increments('id').notNullable();
            table.integer('maintenance_id').notNullable()
            table.foreign('maintenance_id',['FK_maintenance']).references('maintenance.id').onDelete('CASCADE').onUpdate('CASCADE');
            table.dateTime('start_date').notNullable();
            table.dateTime('end_date');
            table.boolean('generated_next').defaultTo(0);
            table.index(['generated_nex'], 'generated_next_index');
        }) 
    ).then(() => 
        knex.schema.raw('CREATE INDEX [maintenance_id] ON [maintenance_timeslot] ([maintenance_id] DESC)'),
        knex.schema.raw('CREATE INDEX [active_timeslot_index] ON [maintenance_timeslot] ([maintenance_id] DESC,[start_date] DESC,[end_date] DESC)')
    ).then(() =>
        knex.schema.createTable('monitor_maintenance', function(table) {
            table.increments('id').notNullable();
            table.integer('monitor_id').notNullable();
            table.integer('maintenance_id').notNullable();
            table.foreign('maintenance_id',['FK_maintenance']).references('maintenance.id').onDelete('CASCADE').onUpdate('CASCADE');
            table.foreign('monitor_id',['FK_monitor']).references('monitor.id').onDelete('CASCADE').onUpdate('CASCADE');
            table.index(['maintenance_id'], 'maintenance_id_index2');
            table.index(['monitor_id'], 'monitor_id_index');
        })
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('monitor_tag')
    .then(() => knex.schema.dropTable('monitor_group'))
    .then(() => knex.schema.dropTable('monitor_notification'))
    .then(() => knex.schema.dropTable('heartbeat'))
    .then(() => knex.schema.dropTable('notification_sent_history'))
    .then(() => knex.schema.dropTable('monitor_tls_info'))
    .then(() => knex.schema.dropTable('tag'))
    .then(() => knex.schema.dropTable('group'))
    .then(() => knex.schema.dropTable('incident'))
    .then(() => knex.schema.dropTable('monitor'))
    .then(() => knex.schema.dropTable('notification'))
    .then(() => knex.schema.dropTable('user'))
    .then(() => knex.schema.dropTable('setting'))
};
