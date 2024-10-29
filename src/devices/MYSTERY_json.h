
const char* _MYSTERY_json = "{\"brand\":\"mystery\",\"model\":\"unknown\",\"model_id\":\"ELG\",\"tag\":\"ff\",\"condition\":[\"manufacturerdata\",\"=\",24,\"index\",0,\"ffff\"],\"properties\":{\"level\":{\"decoder\":[\"value_from_hex_data\",\"manufacturerdata\",16,4,true,false],\"post_proc\":[\"/\",10]},\"volt\":{\"decoder\":[\"value_from_hex_data\",\"manufacturerdata\",20,4,true,false],\"post_proc\":[\"/\",1000]}}}";
/*R""""(
{
   "brand":"mystery",
   "model":"unknown",
   "model_id":"ELG",
   "tag":"ff",
   "condition":["manufacturerdata", "=", 24, "index", 0, "ffff"],
   "properties":{
      "level":{
        "decoder":["value_from_hex_data", "manufacturerdata", 16, 4, true, false],
        "post_proc":["/", 10]
      },
      "volt":{
         "decoder":["value_from_hex_data", "manufacturerdata", 20, 4, true, false],
         "post_proc":["/", 1000]
      }
   }
})"""";*/

const char* _MYSTERY_json_props = "{\"properties\":{\"level\":{\"unit\":\"%\",\"name\":\"level\"},\"volt\":{\"unit\":\"V\",\"name\":\"voltage\"}}}";
/*R""""(
{
   "properties":{
      "level":{
         "unit":"%",
         "name":"level"
      },
      "volt":{
         "unit":"V",
         "name":"voltage"
      }
   }
})"""";*/
