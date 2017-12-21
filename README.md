#Container Tracker Demo
This demo showcases the abilities of the IBM Watson IoT Platform. More specifically the demo makes it possible to connect multiple smartphones as IoT devices 
to a dashboard via IBM Watson IoT Platform. While each of the IoT devices is meant to be installed in a container, the dashboard shows the status of each container.

To get some first impressions of the demo setup, have a look at the following document: [Demo-Setup.pptx](/documentation/Demo-Setup.pptx)

**The demo focuses mainly on three container tracking use-cases:**
1. Tracking the location
2. Tracking the container handling and orientation
3. Looking remotely insight containers

**The following features of the IBM Watson IoT Platform get demonstrated through this demo:**
1. connecting IoT devices to the platform
2. sending data from an IoT device to the platform
3. connecting third-party apps (like a dashboard) to the platform to process the IoT data
4. sending a command to an IoT device via the platform
5. the concept behind edge analytics
6. the high flexibility of the platform since most of the functionality can be accessed via APIs
7. how easy it is to build an IoT PoC using the platform

###Implemented Functionality
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
    - 
5. **Simulating edge analytics**
6. **Giving an overview of all containers** 
7. **Show all available data about one container**

###Envisioned Demo Setup


#Ionic Application (IoT Device)
This application has only been tested with a variety of iOS device yet. Nevertheless, it should also function with Android devices since all the used Cordova plugins support both platforms. 

#NodeRED Dashboard
Ergänzend zu dieser IoT App wurde ein Dashbord entwicklet, welches die IoT Daten visualisiert.
Das Dashboard ist ein Node-RED Flow und kann im Ordner "node-red-flow.json" gefunden werden. 

###Used NodeRED Nodes

###Input Nodes

###Applied Implementation Concept
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

###Remove All Data Stored in Flow-Context
In order to easily delete all the data from the flow-context the "Remove all data" injector has been added to the NodeRED flow.
  

#Setup the demo
Three things are needed in order to setup the demo:
- [Instance of the IBM Watson IoT Platform](https://internetofthings.ibmcloud.com/)
- Android/iOS device
- [NodeRED Server](https://nodered.org/)


![architecture](/documentation/architecture.png)

###Create and configure the IBM Watson IoT Platform
1. an IBM Watson IoT Platform instance can be deployed for free via [IBM Cloud](https://console.bluemix.net/dashboard/apps)
    1. Create an IBM Cloud account
    2. Select the [Internet of Things Platform](https://console.bluemix.net/catalog/services/internet-of-things-platform?taxonomyNavigation=apps) service form the service catalogue
    3. create an instance of the [Internet of Things Platform](https://console.bluemix.net/catalog/services/internet-of-things-platform?taxonomyNavigation=apps) service 
2) visit the UI of the created Internet of Things Platform [service](https://internetofthings.ibmcloud.com/)
3) register as many IoT devices as wanted using "token" as authentication method ([instructions](https://developer.ibm.com/recipes/tutorials/how-to-register-devices-in-ibm-iot-foundation/))
4) register an application to enable the NodeRED Dashboard to access the IoT data later on  

###Deploy the NodeRED Dashboard

###Build and configure the Ionic app
1. configure the application
    1. NodeRED server URL for the picture upload
2. build the application
3. install the application
4. configure the IoT device 

