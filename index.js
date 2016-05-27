#!/usr/bin/env node

"use strict";

var menu = require('node-menu');
var AWS = require('aws-sdk');
var ec2 = new AWS.EC2({region: process.env.AWS_DEFAULT_REGION});
var kexec = require('kexec');

var Instance = function(instance) {
    var self = this;
    self.id = instance.InstanceId;
    self.publicIP = instance.PublicIpAddress;
    instance.Tags.forEach(function(tag) {
        if (tag.Key === 'Name') {
            self.name = tag.Value;
        }
        if (tag.Key === 'aws:cloudformation:stack-name') {
            self.stack = tag.Value;
        }
    });
};

var params = {
    Filters: [
        {
            Name: 'instance-state-name',
            Values: [
                'running'
            ]
        }
    ]
};
ec2.describeInstances(params, function(err, data) {
    // an error occurred
    if (err) {
        console.log(err, err.stack);
        return;
    }
    menu.addDelimiter('-', 60, 'Select instance to login');

    data.Reservations.forEach(function(reservation) {
        reservation.Instances.forEach(function(instance) {
            var i = new Instance(instance);
            var label = i.id + ' - ' + i.name;
            if (i.stack) {
                label += ' - Stack: ' + i.stack;
            }
            menu.addItem(
                label,
                function() {
                    var username = process.argv[2] || 'root';
                    console.log('Connecting to ' + this.publicIP + ' with user ' + username);
                    kexec('ssh', [username + '@' + this.publicIP, '-A', '-o', 'UserKnownHostsFile=/dev/null', '-o', 'StrictHostKeyChecking=no']);
                }, i);
        });
    });

    menu.customHeader(function() {
        })
        .disableDefaultHeader()
        .customPrompt(function() {
                process.stdout.write("\nPlease select instance by number:\n");
        })
        .addDelimiter('*', 60).start();
});