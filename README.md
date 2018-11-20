# maas-odometer

Odometer Demo

Cloud Foudnry Setup
1. Download sources from https://github.wdf.sap.corp/SCP-BCS-MC/maas-odometer
2. go to directory
3. cf login (set API and choose global account) 128MB required
4. Create Multichain Node odometer1
5. cf push -f manifest.yml (automatic binding with node odometer1 and set environment name multichainServiceName (in case multiple nodes are binded)
6. Create stream SAP000S407W212743 ({"method":"create", "params":["stream","SAP000S407W212743", true]})


