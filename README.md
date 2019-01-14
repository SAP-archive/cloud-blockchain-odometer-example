# MaaS Odometer

Deploying an Odometer Application using MultiChain or Hyperledger Fabric blockchain technology.

## Description

In this hands-on example you will use either MultiChain or Hyperledger Fabric blockchain technology to develop and deploy a basic odometer application. This showcases how the service can be used to prevent mileage fraud in vehicles, with the blockchain rejecting any values lower than the previously entered mileage. 

This use case is particularly useful when buying and selling vehicles, ensuring that no attempts have been made to dial back the mileage travelled to date.

## Requirements for MultiChain Technology 

To deploy this application on the MultiChain service you should have the following:
- A familiarity with creating MultiChain service instances: https://help.sap.com/viewer/15cb4580694c4d119793f0d3e9b8a32b/BLOCKCHAIN/en-US/0183c6479c47427ab6257bd37ab8bee3.html 
- An understanding of MultiChain streams and how they can be viewed on the MultiChain dashboard. 
- Downloaded and installed the Cloud Foundry command-line tool: https://docs.cloudfoundry.org/cf-cli/install-go-cli.html
- Downloaded and extracted the application source files from GitHub: https://github.com/SAP/cloud-blockchain-odometer-example/archive/master.zip.  
- Have access to HTTP client software or library of your programming language of choice. In our example we use Postman, but should stress that this is not officially affiliated with SAP or the MultiChain Service.Have a good understanding of JSON-RPC commands and knowledge of using the command-line tool.

## Download and Installation for MultiChain Technology

To download and deploy the MultiChain application, follow the below steps:

1. First download and extract the Odometer application source files from the SAP GitHub profile to your local computer.

2. Next create a MultiChain service instance with the name “mc-odometer".

3. Now open the command-line tool and login to the Cloud Foundry using the command "cf login". You will then be asked for your User ID and Password.

4. Once logged onto the Cloud Foundry, select your SAP Cloud Platform Organization and Space.#

5. Now deploy your application using the command "cf push -f manifest-mc.yml".

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
  - mc-odometer
  env:
    multichainServiceName: mc-odometer

This means that the app has been successfully deployed, bound to your MultiChain service, and started in your global account.
 
## Requirements for Hyperledger Fabric Technology 

To deploy this application on the Hyperledger Fabric service you should have the following:
- A familiarity with creating Hyperledger Fabric service instances: https://help.sap.com/viewer/9d945c48156348aabea50a88d4661033/BLOCKCHAIN/en-US/4c137a58ef7142d1b2e09aa791befe17.html
- An understanding of Hyperledger Fabric channels and how they can be viewed on the Hyperledger Fabric dashboard. 
- Downloaded and installed the Cloud Foundry command-line tool: https://docs.cloudfoundry.org/cf-cli/install-go-cli.html
- Downloaded and extracted the application source files from GitHub: https://github.com/SAP/cloud-blockchain-odometer-example/archive/master.zip.  
- Have access to HTTP client software or library of your programming language of choice. In our example we use Postman, but should stress that this is not officially affiliated with SAP or the MultiChain Service.Have a good understanding of JSON-RPC commands and knowledge of using the command-line tool.

## Download and Installation for Hyperledger Technology

To download and deploy the Hyperledger application, follow the below steps:

1. First download and extract the Odometer application source files from the SAP GitHub profile to your local computer. 

2. Next create a Hyperledger Fabric channel service instance with the name “hlf-odometer". This requires you to select 'Channel' when prompted for your service instance plan. 

3. Now open the command-line tool and login to the Cloud Foundry using the command "cf login". You will then be asked for your User ID and Password.

4. Once logged onto the Cloud Foundry, select your SAP Cloud Platform Organization and Space.#

5. Now deploy your application using the command "cf push -f manifest-hlf.yml".

Note: If you receive the error “The route car-odometer-multichain.cfapps.sap.hana.ondemand.com is already in use”, the app was already deployed on your landscape.

The app will now be deployed to your global account on the SAP Cloud Platform. 

When checking the manifest, you will see the following:
applications:

 name: car-odometer-hyperledger
  memory: 128M
  disk_quota: 512M
  buildpack: https://github.com/cloudfoundry/nodejs-buildpack.git
  command: npm run start
  host: car-odometer-hyperledger
  services:
  - hlf-odometer
  env:
    ServiceName: hlf-odometer

This means that the app has been successfully deployed, bound to your Hyperledger service, and started in your global account.

## Support

There is no support provided for this application.

## License

Copyright (c) 2019 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the SAP Sample Code License except as noted otherwise in the LICENSE file: 
