#!/usr/bin/env node

"use strict";

var argv = require('minimist')(process.argv.slice(2));
var loginUser = argv._[0] || 'root';
var awsRegion = argv.region || process.env.AWS_DEFAULT_REGION;

var menu = require('node-menu');
var AWS = require('aws-sdk');
if (process.env.HTTPS_PROXY || process.env.https_proxy) {
    try {
        var agent = require('proxy-agent');
        AWS.config.update({
            httpOptions: {
                agent: agent(process.env.HTTPS_PROXY || process.env.https_proxy)
            }
        });
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            console.error('Install proxy-agent for proxy support.');
        }
        else {
            throw e;
        }
    }
}

var ec2 = new AWS.EC2({region: awsRegion});
var kexec = require('kexec');

var Instance = function(instance) {
    var self = this;
    self.id = instance.InstanceId;
    self.ip = instance.PublicIpAddress || instance.PrivateIpAddress;
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
                    console.log('Connecting to ' + this.ip + ' with user ' + loginUser);
                    kexec('ssh', [loginUser + '@' + this.ip, '-A', '-o', 'UserKnownHostsFile=/dev/null', '-o', 'StrictHostKeyChecking=no']);
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