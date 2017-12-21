Container Tracker Demo
====================================
This demo showcases the abilities of the IBM Watson IoT Platform. More specifically the demo makes it possible to connect multiple smartphones as IoT devices 
to a dashboard via IBM Watson IoT Platform. While each of the IoT devices is meant to be installed in a container, the dashboard shows the status of each container.

To get some first impressions of the demo setup, have a look at the following document: [Demo-Setup.pptx](/documentation/Demo-Setup.pptx)

### Focused Container Tracking Use-Cases
The demo focuses mainly on three container tracking use-cases:
1. Tracking the location
2. Tracking the container handling and orientation
3. Looking remotely insight containers

### Demonstrated Functions of the IBM Watson IoT Platform
The following features of the IBM Watson IoT Platform get demonstrated through this demo:
1. connecting IoT devices to the platform
2. sending data from an IoT device to the platform
3. connecting third-party apps (like a dashboard) to the platform to process the IoT data
4. sending a command to an IoT device via the platform
5. the concept behind edge analytics
6. connecting a Cloudant DB via the extensions to the platform in order to archive all the IoT data
7. the high flexibility of the platform since most of the functionality can be accessed via APIs
8. how easy it is to build an IoT PoC using the platform

### Implemented Functionality
The following features are currently implemented:
1. **Tracking the location of the container**
    - the location gets determined using the GPS sensor of smartphones
    - the correct position gets displayed on the dashboard in a map
2. **Tracking the orientation of the container**
    - based on the acceleration sensor of the smartphone the orientation of the container gets determined (e.g. if he stands correctly or lies on the left side)
    - the dashboard shows the current orientation of the container in form of a status message
    - the data of the acceleration sensor gets represented in a line graph consisting of three lines while each line represents one of the three spatial axes
    - the data gets send to the dashboard via the IBM Watson IoT Platform and visualized on the dashboard in real-time
3. **Tracking the handling of the container**
    - based on the gyroscope sensor of the smartphone the forces that act on the container get determined (e.g. if the container gets suddenly accelerated or stopped like in the case of an fall the sensor will detect it)
    - the dashboard shows if the container gets currently handled good or not in form of a status message
    - the data of the gyroscope sensor gets represented in a line graph consisting of three lines while each line represents one of the three spatial axes
    - the data gets send to the dashboard via the IBM Watson IoT Platform and visualized on the dashboard in real-time
4. **Taking images of the insight of the container**
    - the IoT devices are abel to receive a "takePicture" command via the IBM Watson IoT Platform
    - the dashboard has a button through which the "takePicture" command can be triggered for a specific IoT device
    - once the smartphone receives the command it automatically takes a picture with the back camera and the led turned on (because of a problem with the [cordova-plugin-camera-preview](https://github.com/cordova-plugin-camera-preview/) this takes up to 10 seconds)
    - once the picture as been taken the IoT device sends it directly to the NodeRED server via a POST request since the IBM Watson IoT Platform does not support messages which or larger than a few kb 
5. **Simulating edge analytics**
    - in order to showcase the idea behind [edge analytics](http://searchbusinessanalytics.techtarget.com/definition/edge-analytics) a switch as been added that controls if the acceleration and gyroscope sensor data should only be added to the graphs if they indicate an exception (this simulates that the device is only sending data if the device is in an exception stage) 
6. **Exceptions**
    - based on the data received form the acceleration and gyroscope data of the devices, the status of the device gets determined by the NodeRED flow
    - if an exception status gets determined an exception message gets generated and presented on the dashboard
7. **Giving an overview of all containers** 
    - do give the user an overview about all devices, the dashboard has a home page which lists all the devices known to the dashboard
    - besides the device name the status, which determines if their are exceptions for a specific device, gets displayed (green circle indicates "no exceptions"; red circle indicates "exceptions")
8. **Show all available data about one container**
    - the dashboard has a device page which displays all the information known about one IoT device
    - which dive to display can be selected via a selector
    - to change the device status of a device from red to green all exceptions of the device have to be deleted via the button "Clear Exceptions"

### Envisioned Demo Setup
The following image gives an overview about the system architecture this demo is based on:

![architecture](/documentation/architecture.png)

The demo can be given using multiple IoT devices (recommended number: 3) since the dashboard supports multiple devices. To enhance the quality
of the demo it is possible to build small containers and bind smartphones to those as shown on the following picture:

![architecture](/documentation/container.png)

Project Structure
====================================
Besides the folders [dashboard](/dashboard) and [documentation](/documentation) all the folders and files from this project belong to an Ionic app! The Ionic app simulates 
an IoT device which connects to the IBM Watson IoT Platform.

The folder [dashboard](/dashboard) contains an exported NodeRED flow. This NodeRED flow represents the dashboard for the demo.

The folder [documentation](/documentation) includes some additional documentation about this demo.

Ionic Application (IoT Device)
====================================
The Ionic application is used for transforming any Android or iOS device into an IoT device for container tracking.
This application has only been tested with a variety of iOS device yet. Nevertheless, it should also function with Android devices since all the used Cordova plugins support both platforms.

### Pages of the App
1. Home Page
    - provides a form to configure the IoT device with the needed credentials in order to connect it to the IBM Watson IoT Platform 
2. Sensor Page
    - connects device to the IBM Watson IoT Platform using the configuration entered on the home page
    - makes sure the device stays awake as long as the sensor page is open
    - collects all sensor data and sends it to the IBM Watson IoT Platform as a JSON object
    - listens for "takePicture" commands send by the IBM Watson IoT Platform and takes an picture and send it to the NodeRED dashboard if requested

### Senors Supportet by the App
1. gyroscope
2. accelerator
3. camera
4. geolocation 

### Used Library to Connect to the IBM Watson IoT Platform
For connecting the ionic app as an IoT device to the IBM Watson IoT Platform the npm package [ibmiotf](https://github.com/ibm-watson-iot/iot-nodejs) has been used.

NodeRED Dashboard
====================================
The NodeRED flow, as it can be found in the folder [dashboard](/dashboard), connects to the IBM Watson IoT Platform as an application.
It receives all the data that gets send to the IBM Watson IoT Platform and displays it in a dashboard.

### Used NodeRED Nodes
Besides the basic NodeRED nodes the following npm packages have been used to implement the dashboard:
1. [node-red-contrib-scx-ibmiotapp](https://github.com/ibm-watson-iot/node-red-contrib-scx-ibmiotapp)
    - for building up a connection to the IBM Watson IoT Platform
2. [node-red-dashboard](https://github.com/node-red/node-red-dashboard)
    - for generating the dashboard ui usind NodeRED
    - the dashboard can be accessed under "<NodeRED-Instance-URL>/ui"
3. [node-red-contrib-web-worldmap ](https://github.com/dceejay/RedMap)
    - for showing the location of the devices in a map
    - 

### Input Nodes

### Applied Implementation Concept
The NodeRED flow is divided into four stages:
1. input nodes
2. processing the input
3. storing the input
4. loading the input data from the storage
5. loading the data into the dashboard UI elements
6. logic of the UI elements

All the data gets stored to the [flow-context](https://nodered.org/docs/writing-functions#flow-context) in the third stage.

The third and fourth stage are not directly linked to each other. Instead, the "Reload UI" node calls all the functions responsible for loading the data from the [flow-context](https://nodered.org/docs/writing-functions#flow-context) and updating the UI elements twice a second.

Since the dashboard contains buttons and a selector the sixth stage is responsible for handling the user interactions. (e.g. sending a command to an IoT device or removing data) 

### Remove All Data Stored in the Flow-Context
In order to easily delete all the data from the flow-context the "Remove all data" injector has been added to the NodeRED flow.
  

Setup the demo
====================================
In order to setup the demo the following components are required:
- [Instance of the IBM Watson IoT Platform](https://internetofthings.ibmcloud.com/)
- [NodeRED Server](https://nodered.org/)
- Android/iOS device
- [Cloudant DB](https://developer.ibm.com/clouddataservices/docs/cloudant/) (optionally)


### Create and configure the IBM Watson IoT Platform
1. an IBM Watson IoT Platform instance can be deployed for free via [IBM Cloud](https://console.bluemix.net/dashboard/apps)
    1. Create an IBM Cloud account
    2. Select the [Internet of Things Platform](https://console.bluemix.net/catalog/services/internet-of-things-platform?taxonomyNavigation=apps) service form the service catalogue
    3. create an instance of the [Internet of Things Platform](https://console.bluemix.net/catalog/services/internet-of-things-platform?taxonomyNavigation=apps) service 
2. visit the UI of the created Internet of Things Platform [service](https://internetofthings.ibmcloud.com/)
3. register as many IoT devices as wanted using "token" as authentication method ([instructions](https://developer.ibm.com/recipes/tutorials/how-to-register-devices-in-ibm-iot-foundation/))
4. register an application to enable the NodeRED Dashboard to access the IoT data later on  

### Deploy and Configure the NodeRED Dashboard
1. Host a NodeRED instance
2. add the following npm packages to the package.json of the NodeRED instance
3. add the following configuration to the "settings.js" of the NodeRED instance
4. start the NodeRED instance
5. import the NodeRED flow
6. configure the credentials needed to connect to the IBM Watson IoT Platform

### Build and configure the Ionic app
1. configure the application
    1. NodeRED server URL for the picture upload
2. build the application
3. install the application
4. configure the IoT device 


### Connecting a Cloudant DB
This step is not necessary for the demo but can still be performed in order to demonstrated how easy it is to achieve all the IoT data send to the IBM Watson IoT Platform.


Author
====================================
Developed by **Paul Wenzel** ([wenzel.paul@de.ibm.com](mailto:wenzel.paul@de.ibm.com)).
