import { defineStore } from 'pinia';

export const useFixedFacesStore = defineStore('fixedFaces', {
  state: () => ({
    // Mapeo de breedId a ajustes de zoom/posición
    faceSettings: {
      abys: { zoom: 1.5, x: '3px', y: '7px' },
      abob: { zoom: 2.2, x: '-45px', y: '17px' },
      acur: { zoom: 2.7, x: '15px', y: '90%' },
      aege: { zoom: 1.7, x: '-1px', y: '12px' },
      bali: { zoom: 1.3, x: '-10px', y: '6px' },
      bamb: { zoom: 2.2, x: '-31px', y: '16px' },
      birm: { zoom: 1.5, x: '-13px', y: '7px' },
      buri: { zoom: 1.9, x: '1px', y: '7px' },
      bslo: { zoom: 1.9, x: '-3px', y: '14px' },
      crex: { zoom: 2.9, x: '-21px', y: '14px' },
      char: { zoom: 1.4, x: '-5px', y: '0px' },
      manx: { zoom: 2.0, x: '5px', y: '12px' },
      amau: { zoom: 2.8, x: '-26px', y: '6px' },
      bure: { zoom: 1.4, x: '-4px', y: '-3px' },
      cypr: { zoom: 2.7, x: '-27px', y: '10px' },
      jbob: { zoom: 3.4, x: '2px', y: '10px' },
      dons: { zoom: 2.1, x: '-5px', y: '10px' },
      siam: { zoom: 2.7, x: '-32px', y: '16px' },
      kuri: { zoom: 3.7, x: '-2px', y: '20px' },
      chau: { zoom: 3.7, x: '-29px', y: '7px' },
      emau: { zoom: 2.7, x: '9px', y: '19px' },
      soma: { zoom: 2.2, x: '-10px', y: '13px' },
      asho: { zoom: 2.2, x: '-2px', y: '16px' },
      cymr: { zoom: 2.0, x: '-42px', y: '7px' },
      amis: { zoom: 2.7, x: '12px', y: '16px' },
      drex: { zoom: 1.5, x: '-22px', y: '10px' },
      kora: { zoom: 2.1, x: '-18px', y: '10px' },
      beng: { zoom: 2.9, x: '7px', y: '19px' },
      mala: { zoom: 2.0, x: '3px', y: '13px' },
      ebur: { zoom: 2.9, x: '-5px', y: '15px' },
      bsho: { zoom: 2.5, x: '-15.45px', y: '18px' },
      sava: { zoom: 2.7, x: '5px', y: '9px' },
      snow: { zoom: 2.5, x: '-1px', y: '18px' },
      tang: { zoom: 2.3, x: '-6px', y: '8px' },
      norw: { zoom: 2.2, x: '-16px', y: '12px' },
      ragd: { zoom: 1.7, x: '-4px', y: '12px' },
      tvan: { zoom: 1.9, x: '1px', y: '10px' },
      mcoo: { zoom: 1.5, x: '-5px', y: '6px' },
      bomb: { zoom: 2.1, x: '-46px', y: '13px' },
      khao: { zoom: 1.2, x: '-7px', y: '5px' },


    },

    otherDimension: {
      abob: { zoom: 2.2, x: '-55px', y: '17px' },
      beng: { zoom: 2.9, x: '9px', y: '23px' },
      bamb: { zoom: 2.2, x: '-39px', y: '21px' },
      birm: { zoom: 1.5, x: '-17px', y: '7px' },
      bslo: { zoom: 1.9, x: '-3px', y: '17px' },
      crex: { zoom: 2.9, x: '-26px', y: '17px' },
      drex: { zoom: 1.5, x: '-27px', y: '10px' },
      mala: { zoom: 2.0, x: '4px', y: '17px' },
      amau: { zoom: 2.8, x: '-32px', y: '7px' },
      cypr: { zoom: 2.7, x: '-34px', y: '13px' },
      ebur: { zoom: 2.9, x: '-6px', y: '19px' },
      jbob: { zoom: 3.4, x: '3px', y: '13px' },
      siam: { zoom: 2.7, x: '-40px', y: '20px' },
      kuri: { zoom: 3.7, x: '-3px', y: '24px' },
      chau: { zoom: 3.4, x: '-36px', y: '9px' },
      emau: { zoom: 2.7, x: '12px', y: '23px' },
      soma: { zoom: 2.2, x: '-12px', y: '13px' },
      acur: { zoom: 2.7, x: '20px', y: '90%' },
      asho: { zoom: 2.2, x: '-3px', y: '20px' },
      cymr: { zoom: 2.0, x: '-51px', y: '9px' },
      amis: { zoom: 2.7, x: '14px', y: '19px' },
      bsho: { zoom: 2.5, x: '-19.8px', y: '22px' },
      sava: { zoom: 2.9, x: '6px', y: '12px' },
      snow: { zoom: 2.6, x: '-2px', y: '22px' },
      tang: { zoom: 2.3, x: '-7px', y: '10px' },
      norw: { zoom: 2.2, x: '-21px', y: '14px' },
      ragd: { zoom: 1.7, x: '-5px', y: '16px' },
      tvan: { zoom: 1.9, x: '1px', y: '10px' },
      bomb: { zoom: 2.1, x: '-58px', y: '18px' },
      khao: { zoom: 1.2, x: '-9px', y: '5px' },
    },

    
    catViewAdjustments: {
      abys: { zoom: 1.0, x: '0px', y: '-15px' },
      tang: { zoom: 1.0, x: '0px', y: '-33px' },
      sing: { zoom: 1.0, x: '0px', y: '-54px' },
      toyg: { zoom: 1.0, x: '0px', y: '-35px' },
      sibe: { zoom: 1.0, x: '-30px', y: '0px' },
      srex: { zoom: 1.0, x: '-100px', y: '0px' },
      sava: { zoom: 1.0, x: '0px', y: '-37px' },
      pers: { zoom: 1.0, x: '-25px', y: '0px' },
      ocic: { zoom: 1.0, x: '-28px', y: '0px' },
      manx: { zoom: 1.0, x: '-17px', y: '0px' },
      lape: { zoom: 1.0, x: '0px', y: '-14px' },
      abob: { zoom: 1.0, x: '-37px', y: '0px' },
      acur: { zoom: 1.0, x: '0px', y: '-31px' },
      bomb: { zoom: 1.0, x: '-51px', y: '0px' },
      buri: { zoom: 1.0, x: '0px', y: '-31px' },
      cspa: { zoom: 1.0, x: '-44px', y: '0px' },
      ctif: { zoom: 1.0, x: '0px', y: '-41px' },
      char: { zoom: 1.0, x: '0px', y: '-55px' },
      cymr: { zoom: 1.0, x: '-30px', y: '0px' },
      drex: { zoom: 1.0, x: '-56px', y: '0px' },
      lihu: { zoom: 1.0, x: '0px', y: '-41px' },
      java: { zoom: 1.0, x: '0px', y: '-4px' },
      kuri: { zoom: 1.0, x: '0px', y: '-7px' },
      chee: { zoom: 1.0, x: '0px', y: '-9px' },
      mcoo: { zoom: 1.0, x: '0px', y: '-26px' },
      mala: { zoom: 1.0, x: '0px', y: '-6px' },
      amis: { zoom: 1.0, x: '0px', y: '-15px' },
      soma: { zoom: 1.0, x: '0px', y: '-21px' },
      ycho: { zoom: 1.0, x: '0px', y: '-9px' },
      ragd: { zoom: 1.0, x: '0px', y: '-4px' },
      tvan: { zoom: 1.0, x: '0px', y: '-23px' },
      orie: { zoom: 1.0, x: '0px', y: '0px' },
      bslo: { zoom: 1.0, x: '0px', y: '-6px' },
      csho: { zoom: 1.0, x: '0px', y: '-3px' },
      bsho: { zoom: 1.0, x: '0px', y: '0px' },
      
    }
  }),
  actions: {
    getSettings(breedId, isOtherDimension = false, isCatView = false) {
     
      if (isCatView) {
        return this.catViewAdjustments[breedId] ||  { zoom: 1, x: 'center', y: 'center' };
      }
      if (isOtherDimension) {
        return this.otherDimension[breedId] || this.faceSettings[breedId] || { zoom: 1, x: '0px', y: '0px' };
      }
      return this.faceSettings[breedId] || { zoom: 1, x: '0px', y: '0px' };
    },
    updateSettings(breedId, newSettings, isOtherDimension = false, isCatView = false) {
      if (isOtherDimension) {
        this.otherDimension[breedId] = newSettings;
      } else if (isCatView){
        this.catViewAdjustments[breedId] = newSettings;
      } else {
        this.faceSettings[breedId] = newSettings;
      }
    }

  }
});