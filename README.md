# ec2login

ec2login is a ssh login wrapper written in NodeJS. It lists all running EC2 
instances in a given region and prompts for the one you want to connect to.
It then launches an SSH session to the desired instance. If no user is provided it uses `root`.

The region to use is determined by the environment variable `AWS_DEFAULT_REGION`.

If the instance does not have a public IP address the private one is used to connect.

## Installation

To install ec2login open a terminal and issue: `npm install -g ec2login`

## Usage

To connect to an EC2 instance type `ec2login` in a shell and select the instance in the menu. 
You have to provide the desired AWS region using the `AWS_DEFAULT_REGION` environment variable 
or using the `--region <region>` cli option.

By specifying the option `--private` you can connect to the private IP of the instance instead of the public one. 
This is useful if you have a VPN connection to your VPC running the instance. 

If you do not want to use the `root` user you can provide any other user as the first argument to the script:

e.g. `ec2login ec2-user`

## SSH Connection

The SSH connection is opened with StrictHostKeyChecking disabled because of the dynamic nature of the 
public IP addresses of EC2 instances.

Agent Forwarding is enabled to allow for jumping to other hosts in AWS.

## Contribute

Feel free to open issues, provide code improvements or updates to the documentation.

## License

The script is licensed under the MIT license and provided as-is.

