// Where we will hold our components, templates and custom data
// We pull data processed from the parent data for each component
// In a production app, we can seperate these components into their seperate files
// And import their templates using routes which would be cleaner and reduce load latency

//Search & Filter Template
// Vue.component('button-counter', {
//   data: function () {
//     return {
//       count: 5
//     }
//   },
//   template: '<button v-on:click="$parent.limit+=5">You clicked me {{  $parent.limit}} times.</button>'
// })


// Main filter application $parent.companies[0]
new Vue({
  el: '#app',

  data() {
    return {
      suggest:false, //Toggles suggestions
      suggest_thresh: 5,

      loading: false,
      isOpen : true, //Toggle filter options
      suggested_max: 4, //Suggestion item amount
      search:'', //Search field
      limit:6, //Limits the amount of JSON data 
      skip:0, //Counter used for updating JSON limit

      companies: [],
      dropdown: { height: 0 },
      rating: { min: 10, max: 0 },
      filters: { Artforms: {},  Genres: {}, countries: {} },  //add companies filter
      menus: { Artforms: false, Genres: false, countries: true }
    }
  },

  computed: {

    activeMenu() {
      return  Object.keys(this.menus).reduce(($$, set, i) => (this.menus[set]) ? i : $$, -1)
    },

 list() {
      let { Artforms, countries, Genres } = this.activeFilters

      return this.companies.filter(({ country, keywords, artform })  => {
        if (countries.length && !~countries.indexOf(country)) return false
        if (!Artforms.length || Artforms.every(cat => ~artform.indexOf(cat)))
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
        return (this.search) ? list.name.toLowerCase().includes(this.search.toLowerCase()) : list;

      }).slice(this.skip, this.skip + this.limit) //limits the amount of filtered items on the page
    },

    activeFilters() {
      let { countries, Genres, Artforms } = this.filters

      return {
        countries: Object.keys(countries).filter(fl => countries[fl]),
        Genres: Object.keys(Genres).filter(fl => Genres[fl]),
        Artforms: Object.keys(Artforms).filter(fl => Artforms[fl])
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

        companies.forEach(({ country, keywords, artform }) => {
          this.$set(this.filters.countries, country, false)
          this.$set(this.filters.Artforms, artform, false)


          
          keywords.forEach(category => {
            this.$set(this.filters.Genres, category, false)
          })


        })
      })
  }
})


