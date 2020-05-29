import unittest
import requests
import time
import os

#### clears the replica1 image, subnet and then rebuilds them and runs replica1

subnetName = "mynet"
subnetAddress = "10.10.0.0/16"

replica1Ip = "10.10.0.2"
replica1HostPort = "8082"
replica1SocketAddress = replica1Ip + ":8085"

replica2Ip = "10.10.0.3"
replica2HostPort = "8083"
replica2SocketAddress = replica2Ip + ":8085"

replica3Ip = "10.10.0.4"
replica3HostPort = "8084"
replica3SocketAddress = replica3Ip + ":8085"

view = replica1SocketAddress + "," + replica2SocketAddress + "," + replica3SocketAddress

######## FUNCTIONS ##########

def stopAndRemoveInstance(instanceName):
    stopCommand = "docker stop " + instanceName
    removeCommand = "docker rm " + instanceName
    os.system(stopCommand)
    time.sleep(2)
    os.system(removeCommand)

def buildDockerImage():
    command = "docker build -t assignment3-img ."
    os.system(command)

def runReplica(hostPort, ipAddress, subnetName, instanceName):
    command = "docker run -p " + hostPort + ":8085 --net=" + subnetName + " --ip=" + ipAddress + " --name=" + instanceName + " -e SOCKET_ADDRESS=" + ipAddress + ":8085" + " -e VIEW=" + view + " assignment3-img"
    os.system(command)
    time.sleep(20)

def removeSubnet(subnetName):
    command = "docker network rm " + subnetName
    os.system(command)
    time.sleep(2)

def createSubnet(subnetAddress, subnetName):
    command  = "docker network create --subnet=" + subnetAddress + " " + subnetName
    os.system(command)
    time.sleep(2)

if __name__ == '__main__':
    stopAndRemoveInstance("replica1")
    stopAndRemoveInstance("replica2")
    stopAndRemoveInstance("replica3")
    removeSubnet(subnetName)
    # createSubnet(subnetAddress, subnetName)
    # buildDockerImage()
    # runReplica(replica1HostPort, replica1Ip, subnetName, "replica1")
    # runReplica(replica2HostPort, replica2Ip, subnetName, "replica2")
    # runReplica(replica3HostPort, replica3Ip, subnetName, "replica3")