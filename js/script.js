// Where we will hold our components, templates and custom data
// We pull data processed from the parent data for each component
// In a production app, we can seperate these components into their seperate files
// And import their templates using routes which would be cleaner and reduce load latency

//Load more results
Vue.component('button-counter', {
  data: function () {
    return {
      count: null
    }
  },
  template: '<button v-on:click="$parent.limit+=5">Load {{  $parent.limit}} more.</button>'
})

// Main filter application $parent.companies[0]
new Vue({
  el: '#app',

  data() {
    return {
      image: 0,
      suggest:false, //Toggles suggestions
      suggest_thresh: 5,
      suggested: 'wh',
      loading: false,
      isOpen : true, //Toggle filter options
      suggested_max: 4, //Suggestion item amount
      search:'', //Search field
      limit:6, //Limits the amount of JSON data 
      skip:0, //Counter used for updating JSON limit

      companies: [],
      dropdown: { height: 0 },
      rating: { min: 10, max: 0 },
      // filters: { Artforms: {},  Genres: {}, Countries: {} },  //add companies filter
      // menus: { Artforms: false, Genres: false, Countries: true }
      filters: { Artforms: {},  Genres: {}, Dates: {}, Locations: {}, Capacity: {}, Price: {}, Creativelearning: {}, Countries: {}, Facilities: {}, Staging: {}, Funding: {}, Status: {} },
      menus: { Artforms: false,  Genres: true, Dates: false, Locations: false, Capacity: false, Price: false, Creativelearning: false, Countries: false, Facilities: false, Staging: false, Funding: false, Status: false }
    }
  },

  computed: {

  
    activeMenu() {
      return  Object.keys(this.menus).reduce(($$, set, i) => (this.menus[set]) ? i : $$, -1)
    },

 list() {
      let { Artforms, Genres, Dates, Locations, Capacity, Price, Creativelearning, Countries, Facilities, Staging, Funding, Status  } = this.activeFilters

      return this.companies.filter(({ country, keywords, artform, dates, location, capacity, price, creativelearning, facilities, staging, fundedby, status })  => {
        if (Countries.length && !~Countries.indexOf(country)) return false
        if (!Artforms.length || Artforms.every(cat => ~artform.indexOf(cat)))
        if (!Dates.length || Dates.every(cat => ~dates.indexOf(cat)))
        if (!Locations.length ||Locations.every(cat => ~location.indexOf(cat)))
        if (!Capacity.length || Capacity.every(cat => ~capacity.indexOf(cat)))
        if (!Price.length || Price.every(cat => ~price.indexOf(cat)))
        if (!Creativelearning.length || Creativelearning.every(cat => ~creativelearning.indexOf(cat)))
        if (!Facilities.length || Facilities.every(cat => ~facilities.indexOf(cat)))
        if (!Staging.length || Staging.every(cat => ~staging.indexOf(cat)))
        if (!Funding.length || Funding.every(cat => ~fundedby.indexOf(cat)))
        if (!Status.length || Status.every(cat => ~status.indexOf(cat)))
        return !Genres.length || Genres.every(cat => ~keywords.indexOf(cat))
        
      })
    },  

    // Filters the JSON list for search component
    filteredList() {
      
      return this.list.filter(list => {
        return (this.search) ? list.name.toLowerCase().includes(this.search.toLowerCase()) : list;

      }).slice(this.skip, this.skip + this.limit) //limits the amount of filtered items on the page
    },

    suggestedList() {
      
      return this.list.filter(list => {
        return (this.suggested) ? list.name.toLowerCase().includes(this.suggested.toLowerCase()) : list;

      }).slice(this.skip, this.skip + this.suggested_max) //limits the amount of suggested items on the page
    },

    activeFilters() {
      let { Artforms, Genres, Dates, Locations, Capacity, Price, Creativelearning, Countries, Facilities, Staging, Funding, Status } = this.filters

      return {
        Countries: Object.keys(Countries).filter(fl => Countries[fl]),
        Genres: Object.keys(Genres).filter(fl => Genres[fl]),
        Dates: Object.keys(Dates).filter(fl => Dates[fl]),
        Locations: Object.keys(Locations).filter(fl => Locations[fl]),
        Capacity: Object.keys(Capacity).filter(fl => Capacity[fl]),
        Price: Object.keys(Price).filter(fl => Price[fl]),
        Creativelearning: Object.keys(Creativelearning).filter(fl => Creativelearning[fl]),
        Facilities: Object.keys(Facilities).filter(fl => Facilities[fl]),
        Staging: Object.keys(Staging).filter(fl => Staging[fl]),
        Funding: Object.keys(Funding).filter(fl => Funding[fl]),
        Status: Object.keys(Status).filter(fl => Status[fl]),
        Artforms: Object.keys(Artforms).filter(fl => Artforms[fl])
      }
    }
  },

  watch: {
    add() {
      image++
      return image
          },
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
      if (filter === 'Countries') {
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

        companies.forEach(({ dates, location, capacity, price, creativelearning, facilities, staging, fundedby, status, country, keywords, artform }) => {
          this.$set(this.filters.Countries, country, false)
          this.$set(this.filters.Artforms, artform, false)

          
          //this.$set(this.filters.Dates, dates, false)
          this.$set(this.filters.Locations, location, false)
          this.$set(this.filters.Capacity, capacity, false)
          this.$set(this.filters.Price, price, false)
          this.$set(this.filters.Creativelearning, creativelearning, false)
          this.$set(this.filters.Facilities, facilities, false)
          this.$set(this.filters.Staging, staging, false)
          this.$set(this.filters.Funding, fundedby, false)
          
          keywords.forEach(category => {
            this.$set(this.filters.Genres, category, false)
          })


        })
      })
  }
})


