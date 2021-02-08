import Vue from "vue"
import Vuex from "vuex"
 
Vue.use(Vuex);
 
export default new Vuex.Store({
    state:{
        baseHost: "192.168.1.212:2082",
        userSpaceSize: 1 * 1024 * 1024 *1024,  //1GB
        adminSpaceSize: 2 * 1024 * 1024 *1024, //2GB
        userUUID: "",
        userName: "",
        modUserUUID: "",
    },
    mutations:{
      
        saveUserUUID(state, userUUID) {
            state.userUUID = userUUID;
        },
      
        saveUserName(state, userName) {
            state.userName = userName;
        },
      
        saveModUserUUID(state, modUserUUID) {
            state.modUserUUID = modUserUUID;
        }
      
    }
})