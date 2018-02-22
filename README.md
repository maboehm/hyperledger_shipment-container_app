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
1. Connecting IoT devices to the platform
2. Sending data from an IoT device to the platform
3. Connecting third-party apps (like a dashboard) to the platform to process the IoT data
4. Sending a command to an IoT device via the platform
5. The concept behind edge analytics
6. Connecting a Cloudant DB via the extensions to the platform in order to archive all the IoT data
7. The High flexibility of the platform since most of the functionality can be accessed via APIs
8. How easy it is to build an IoT PoC using the platform

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
    - based on the gyroscope sensor of the smartphone the forces that act on the container get determined (e.g. if the container gets suddenly accelerated or stopped like in the case of a fall the sensor will detect it)
    - the dashboard shows if the container gets currently handled good or not in form of a status message
    - the data of the gyroscope sensor gets represented in a line graph consisting of three lines while each line represents one of the three spatial axes
    - the data gets send to the dashboard via the IBM Watson IoT Platform and visualized on the dashboard in real-time
4. **Taking images of the insight of the container**
    - the IoT devices are able to receive a "takePicture" command via the IBM Watson IoT Platform
    - the dashboard has a button through which the "takePicture" command can be triggered for a specific IoT device
    - once the smartphone receives the command it automatically takes a picture with the back camera and the led turned on (because of a problem with the [cordova-plugin-camera-preview](https://github.com/cordova-plugin-camera-preview/) this takes up to 10 seconds)
    - once the picture has been taken the IoT device sends it directly to the NodeRED server via a POST request since the IBM Watson IoT Platform does not support messages which or larger than a few kb 
5. **Simulating edge analytics**
    - in order to showcase the idea behind [edge analytics](http://searchbusinessanalytics.techtarget.com/definition/edge-analytics) a switch has been added that controls if the acceleration and gyroscope sensor data should only be added to the graphs if they indicate an exception (this simulates that the device is only sending data if the device is in an exception stage) 
6. **Exceptions**
    - based on the data received from the acceleration and gyroscope data of the devices, the status of the device gets determined by the NodeRED flow
    - if an exception status gets determined an exception message gets generated and presented on the dashboard
7. **Giving an overview of all containers** 
    - to give the user an overview of all devices, the dashboard has a home page which lists all the devices known to the dashboard
    - besides the device name the status, which determines if there are exceptions for a specific device, gets displayed (green circle indicates "no exceptions"; red circle indicates "exceptions")
8. **Show all available data about one container**
    - the dashboard has a device page which displays all the information known about one IoT device
    - which dive to display can be selected via a selector
    - to change the device status of a device from red to green all exceptions of the device have to be deleted via the button "Clear Exceptions"

### Envisioned Demo Setup
The following image gives an overview of the system architecture this demo is based on:

![architecture](/documentation/architecture.png)

The demo can be given using multiple IoT devices (recommended number: 3) since the dashboard supports multiple devices. To enhance the quality
of the demo it is possible to build small containers and bind smartphones to those as shown in the following picture:

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
    - Provides a form to configure the IoT device with the needed credentials in order to connect it to the IBM Watson IoT Platform 
2. Sensor Page
    - Connects device to the IBM Watson IoT Platform using the configuration entered on the home page
    - Makes sure the device stays awake as long as the sensor page is open
    - Collects all sensor data and sends it to the IBM Watson IoT Platform as a JSON object
    - Listens for "takePicture" commands send by the IBM Watson IoT Platform and takes a picture and send it to the NodeRED dashboard if requested

### Senors Supported by the App
1. Gyroscope
2. Accelerator
3. Camera
4. Geolocation / GPS

### Used Library to Connect to the IBM Watson IoT Platform
For connecting the ionic app as an IoT device to the IBM Watson IoT Platform the npm package [ibmiotf](https://github.com/ibm-watson-iot/iot-nodejs) has been used.

NodeRED Dashboard
====================================
The NodeRED flow, as it can be found in the folder [dashboard](/dashboard), connects to the IBM Watson IoT Platform as an application.
It receives all the data that gets sent to the IBM Watson IoT Platform and displays it on a dashboard.

### Used NodeRED Nodes
Besides the basic NodeRED nodes the following npm packages have been used to implement the dashboard:
1. [node-red-contrib-scx-ibmiotapp](https://github.com/ibm-watson-iot/node-red-contrib-scx-ibmiotapp)
    - For building up a connection to the IBM Watson IoT Platform
2. [node-red-dashboard](https://github.com/node-red/node-red-dashboard)
    - For generating the dashboard ui usind NodeRED
    - The dashboard can be accessed under the following URL: ".../ui"
3. [node-red-contrib-web-worldmap ](https://github.com/dceejay/RedMap)
    - For showing the location of the devices in form of a map

### Applied Implementation Concept
The NodeRED flow is divided into four stages:
1. Input nodes
2. Processing the input
3. Storing the input
4. Loading the input data from the storage
5. Loading the data into the dashboard UI elements
6. Logic of the UI elements

All the data gets stored in the [flow-context](https://nodered.org/docs/writing-functions#flow-context) in the third stage.

The third and fourth stage is not directly linked to each other. Instead, the "Reload UI" node calls all the functions responsible for loading the data from the [flow-context](https://nodered.org/docs/writing-functions#flow-context) and updating the UI elements twice a second.

Since the dashboard contains buttons and a selector the sixth stage is responsible for handling the user interactions. (e.g. sending a command to an IoT device or removing data) 

### Remove All Data Stored in the Flow-Context
In order to easily delete all the data from the flow-context the "Remove all data" injector has been added to the NodeRED flow.
  

Integration with Blockchain
===================================
An integration with a Hyperledger Blockchain was later implemented to demonstrate how Blockchain-Technology could be used to reduce
the requirement of trust in a network. Instead of publishing all sensor data (as is the case with the WatonIoT-Platform), the Blockchain integration
only publishes Exceptions, which are detected on device and sent directly to a Compoer-REST-Server. This functionality can be disabled in
the *app.config.ts*-file.

For more information and setup instructions, please refer to the [Business Network Repository](https://github.com/m2hofi94/hyperledger_shipment-business_network).

Setup the Demo
====================================
In order to setup the demo the following components are required:
- [Instance of the IBM Watson IoT Platform](https://internetofthings.ibmcloud.com/)
- [NodeRED Server](https://nodered.org/)
- Android/iOS device
- [Cloudant DB](https://developer.ibm.com/clouddataservices/docs/cloudant/) (optional)


### Create and Configure the IBM Watson IoT Platform
1. Create an IBM Watson IoT Platform instance for free via [IBM Cloud](https://console.bluemix.net/dashboard/apps)
    1. Select the [Internet of Things Platform](https://console.bluemix.net/catalog/services/internet-of-things-platform?taxonomyNavigation=apps) service form the service catalog
    2. Create an instance of the [Internet of Things Platform](https://console.bluemix.net/catalog/services/internet-of-things-platform?taxonomyNavigation=apps) service 
2. Visit the UI of the created Internet of Things Platform [service](https://internetofthings.ibmcloud.com/)
3. Register as many IoT devices as wanted using "token" as authentication method ([instructions](https://developer.ibm.com/recipes/tutorials/how-to-register-devices-in-ibm-iot-foundation/))
4. Register an application to enable the NodeRED Dashboard to access the IoT data later on  

### Deploy and Configure the NodeRED Dashboard
1. Host a NodeRED instance (e.g. for free via [IBM Cloud](https://console.bluemix.net/dashboard/apps) using the [Node-RED Starter](https://console.bluemix.net/catalog/starters/node-red-starter?taxonomyNavigation=apps) boilerplate)
2. Add the following npm packages to the package.json of the NodeRED instance
    
    ```javascript
    {
      [...]
      "dependencies": {  
              [...]
              "node-red-contrib-scx-ibmiotapp": "0.0.47",
              "node-red-dashboard": "^2.6.2",
              "node-red-contrib-web-worldmap":"1.x",
              [...]
      }
      [...]
    }
    ```
3. Add the following configuration to the "settings.js" (under IBM Cloud this file is called "bluemix-settings.js"") of the NodeRED instance to increase the allowed size of HTTP requests in order to be able to sen images properly and to allow CORS
    
    ```javascript
    var settings = module.exports = {
         [...]
        
        // allows CORS
        httpNodeCors: {origin: true},
        
        // allows HTTP requests to be 5mb large
        apiMaxLength: '60mb',
    
        [...]
    };
    ```
4. Start the NodeRED instance
5. Import the NodeRED flow from [node-red-flow.json](/dashboard/node-red-flow.json) and deploy it ([introductions](https://developers.sensetecnic.com/article/how-to-import-a-node-red-flow/) )
6. Configure the credentials needed to connect to the IBM Watson IoT Platform
    1. Open the "IBM Watson IoT Platform" node
    2. Edit the API Key
    3. Enter the API Key and API Token generated while registering a new application to the IBM Watson IoT Platform
    4. Confirm the changes and deploy the flow
7. Access the dashboard via the following URL: ".../ui"

### Build and Configure the Ionic App
1. Configure the application
    1. Open [/src/app/app.config.ts](/src/app/app.config.ts)
    2. NodeRED server URL for the picture upload
2. Build the application

    ```sh
    $ npm install
    $ ionic cordova build
    ```
3. Install the build application on your device
4. Start the app
5. Enter the organization name of your IBM Watson IoT Platform instance, the device type, the device ID and authentication token as generated while registering the IoT devices to the IBM Watson IoT Platform 
  


### Connect a Cloudant DB (optional)
This step is not necessary for the demo but can still be performed in order to demonstrate how easy it is to archive all the IoT data send to the IBM Watson IoT Platform in a NoSQL database.

1. Host a Cloudant database for free via [IBM Cloud](https://console.bluemix.net/dashboard/apps) using the [Cloudant NoSQL DB](https://console.bluemix.net/catalog/services/cloudant-nosql-db?taxonomyNavigation=apps) service
2. Connect the Cloudant instance to your IBM Watson IoT Platform instance ([instructions](https://developer.ibm.com/recipes/tutorials/cloudant-nosql-db-as-historian-data-storage-for-ibm-watson-iot-parti/#r_step3)) 


Authors
====================================
Developed by **Paul Wenzel** ([wenzel.paul@de.ibm.com](mailto:wenzel.paul@de.ibm.com)).

Blockchain-Integration by **Marcel Hofmann* ([info@marcelhofmann.com](mailto:info@marcelhofmann.com)).
