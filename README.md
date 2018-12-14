# MaaS Odometer

Deploying an Odometer Application using MultiChain Service

## Description

In this hands-on example you will use the MultiChain service to develop and deploy a basic odometer application. This showcases how the service can be used to prevent mileage fraud in vehicles, with the blockchain rejecting any values lower than the previously entered mileage. 

This use case is particularly useful when buying and selling vehicles, ensuring that no attempts have been made to dial back the mileage travelled to date.

## Requirements

To deploy this application on the MultiChain service you should have the following:
- A familiarity with creating MultiChain service instances. 
- An understanding of MultiChain streams and how they can be viewed on the MultiChain dashboard. 
- Downloaded and installed the Cloud Foundry command-line tool.
- Have access to HTTP client software or library of your programming language of choice. In our example we use Postman, but should stress that this is not officially affiliated with SAP or the MultiChain Service.Have a good understanding of JSON-RPC commands and knowledge of using the command-line tool.

## Download and Installation

To download and deploy the MultiChain application, follow the below steps:

1. First download the Odometer application source files from the SAP GitHub profile to your local computer

2. Next create a MultiChain service instance with the name “odometer1”.

3. Now open the command-line tool and login to the Cloud Foundry using the command "cf login". You will then be asked for your User ID and Password.

4. Once logged onto the Cloud Foundry, select your SAP Cloud Platform Organization and Space.#

5. Now deploy your application using the command "cf push -f manifest.yml".

Note: If you receive the error “The route car-odometer-multichain.cfapps.sap.hana.ondemand.com is already in use”, the app was already deployed on your landscape. If so, use the command “cf push -f manifest.yml -n my-odometer”. 

The app will now be deployed to your global account on the SAP Cloud Platform. 

When checking the manifest, you will see the following:
applications:

 name: car-odometer-multichain
  memory: 128M
  disk_quota: 512M
  buildpack: https://github.com/cloudfoundry/nodejs-buildpack.git
  command: npm run start
  host: car-odometer-multichain
  services:
  - odometer1
  env:
    multichainServiceName: odometer1

This means that the app has been successfully deployed, bound to your MultiChain service, and started in your global account.

6. Next, the app requires that you have a created a MultiChain stream with the license plate SAP000S407W212743. To do this, create a stream using the following RPC call:

POST  HTTP/1.1
Host: maas-proxy.cfapps.sap.hana.ondemand.com/<instance ID>/rpc
(HEADER) apikey: <your API Key>
(BODY) {"method": "create", "params": ["stream", "SAP000S407W212743", true] }

## Support

For Support please refer to the following article: https://help.sap.com/viewer/d83cdf0945f540218a64add9265835af/BLOCKCHAIN/en-US

## License

Copyright (c) 2018 SAP SE or an SAP affiliate company. All rights reserved.


