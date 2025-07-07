import { defineStore } from 'pinia';


export const useMissingImagesStore = defineStore('missingImages', {
  state: () => ({
    overrides: {
      drex: 'https://www.infobae.com/resizer/v2/WL3HHF6E3FE7ZP25JJAGZPGHTE.jpg?auth=70e5eb6f3044f94c44f7870196cb2e5880f23966d7a0c8951e031ff9c807a139&smart=true&width=992&height=558&quality=85',
      kora: 'https://animalxop.com/cdn/shop/articles/OIP_81_640x550_crop_center.jpg?v=1701896597',
      beng: 'https://www.dondemiveterinario.com/wp-content/uploads/2021/02/gato-bengali.jpg',
      mala: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/IMGP1134_%2851750850378%29.jpg/250px-IMGP1134_%2851750850378%29.jpg',
      ebur: 'https://cfa.org/wp-content/uploads/2024/03/European-Burmese_Chanan_Portrait.jpg',
    }
  }),
  getters: {
    getImage: (state) => (breedId) => state.overrides[breedId] || null
  }
});

