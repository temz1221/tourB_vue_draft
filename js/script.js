new Vue({
  el: '#app',

  data() {
    return {
      isOpen : false,
      suggested: 4,
      search:'',
      companies: [],
      dropdown: { height: 0 },
      rating: { min: 10, max: 0 },
      filters: { countries: {}, categories: {}, rating: 0 },
      menus: { countries: false, categories: false }
    }
  },

  computed: {

    activeMenu() {
      return  Object.keys(this.menus).reduce(($$, set, i) => (this.menus[set]) ? i : $$, -1)
    },

    list() {
      let { countries, categories } = this.activeFilters

      return this.companies.filter(({ country, keywords, rating }) => {
        if (rating < this.filters.rating) return false
        if (countries.length && !~countries.indexOf(country)) return false
        return !categories.length || categories.every(cat => ~keywords.indexOf(cat))
        
      })
    },  
    filteredList() {
      return this.company.filter(list => {
        return list.company.name.toLowerCase().includes(this.search.toLowerCase())
      })
    },

    activeFilters() {
      let { countries, categories } = this.filters

      return {
        countries: Object.keys(countries).filter(fl => countries[fl]),
        categories: Object.keys(categories).filter(fl => categories[fl])
      }
    }
  },

  watch: {
    activeMenu(index, from) {
      if (index === from) return;

      this.$nextTick(() => {
        if (!this.$refs.menu || !this.$refs.menu[index]) {
          this.dropdown.height = 0
        } else {
          this.dropdown.height = `${this.$refs.menu[index].clientHeight + 16}px`
        }
      })
    }
  },
  

  methods: {
    setFilter(filter, option) {
      if (filter === 'countries') {
        this.filters[filter][option] = !this.filters[filter][option]
      } else {
          this.clearFilter(filter, option, this.filters[filter][option])
      }
    },

    clearFilter(filter, except, active) {
      if (filter === 'rating') {
        this.filters[filter] = this.rating.min
      } else {
        Object.keys(this.filters[filter]).forEach(option => {
          this.filters[filter][option] = except === option && !active
        })
      }
    },

    clearAllFilters() {
      Object.keys(this.filters).forEach(this.clearFilter)
    },

    //Create the menu items by looping from the menu object
    setMenu(menu, active) {
      Object.keys(this.menus).forEach(tab => {
        this.menus[tab] = !active && tab === menu
      })
    }
  },

  //Fetch JSON data before the app has mounted
  //Contains menu keywords and items
  beforeMount() {
    fetch('data.json')
      .then(response => response.json())
      .then(companies => {
        this.companies = companies

        companies.forEach(({ country, keywords, rating }) => {
          this.$set(this.filters.countries, country, false)

          if (this.rating.max < rating) this.rating.max = rating
          if (this.rating.min > rating) {
            this.rating.min = rating
            this.filters.rating = rating
          }

          keywords.forEach(category => {
            this.$set(this.filters.categories, category, false)
          })
        })
      })
  }
})


