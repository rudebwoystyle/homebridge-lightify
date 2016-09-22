var lightify = require('node-lightify'),
           _ = require('underscore');

var Service, Characteristic;


function LightifyPlatform(log, config, api) {
   console.log("HELLO! ITS ME! LGIHTFY!!");
   log("HI");
   this.log = log;
   this.config = config;
   this.host = config['host']
   this.api = api;
   this.accessories = []
   try {
     this.init();
   } catch (e) {
     this.log(e);
   }
 }

 LightifyPlatform.prototype.init = function(callback) {
   this.log("hello");
   let self = this;
   const platformAccessory = new Accessory(name, UUIDGen.generate(self.host), 5 /* Accessory.Categories.LIGHTBULB_TCTYPE */);

   lightify.start(host).then(function(data){
       return lightify.discovery();
   }).then(function(response) {
       self.log(response);
       let list = _.map(response.result, (device) => {
         // We will only add lights
         //if(lightify.isLight(device['type'])) {
         self.log(device);
           self.addAccessory(device);
         //}
       });
       //callback(list);
       //this.api.registerPlatformAccessories('homebridge-lightify', 'Lightify', [platformAccessory]);
   });
 }

 LightifyPlatform.prototype.addAccessory = function(device) {
   this.log("Registration of:" , device);
   let self = this;
   let uuid = UUIDGen.generate(device.name);
   let accessory = new Accessory(device.name, uuid);
   accessory.addService(Service.Lightbulb, device.name)
   .getCharacteristic(Characteristic.On)
   .on('set', function(value, callback) {
     self.lightify.node_on_off(device.mac, value);
    callback();
    });
    this.accessories.push(newAccessory);
    this.api.registerPlatformAccessories("homebridge-lightify", "Lightify", [accessory]);
 }


class LightifyAccessory {

  constructor(log, config, lightify, device) {
    this.log = log;
    this.config = config;
    this.id = device['id'];
    this.name = device['name'];
    this.fw_version = device['firmware_version'];
    this.device = device;
    this.lightify = lightify;
    this.api = api;
    let self = this;
    this.api.registerPlatformAccessories("homebridge-lightify", "Lightify", self.getServices());
  }

  setOn(state, callback) {
    let self = this;
    self.lightify.node_on_off(self.device['mac'], state);
    if(callback) {
      callback();
    }
  }

  setOff(callback) {
    let self = this;
    this.lightify.discovery().then((response) => {
      let info = _.findWhere(response.result, {"id": self.id});
      callback(status == 1);
    });
  }

  getServices() {
    let self = this;
    let informationService = new Service.AccessoryInformation();
    let lightbulbService = new Service.Lightbulb(this.name);

	  informationService.setCharacteristic(Characteristic.Manufacturer, "OSRAM Licht AG")
                  		.setCharacteristic(Characteristic.Model, "Lightify")
                  		.addCharacteristic(Characteristic.FirmwareRevision, this.fw_version);

    lightbulbService.getCharacteristic(Characteristic.On)
                    .on('get', self.getOn)
                    .on('set', self.setOn)

    return [informationService, lightbulbService];
  }

}

module.exports = function(homebridge) {
  console.log("homebridge API version: " + homebridge.version);

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerPlatform("homebridge-lightify", "Lightify", LightifyPlatform, true);
}
