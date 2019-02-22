var eventBus = new Vue()

Vue.component('product-details', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: /*html*/`<ul>
    <li v-for="detail in details">{{ detail }}</li>
  </ul>`

})

Vue.component('product-review', {
  template: /*html*/`<div class="form-holder"><form class="review-form" @submit.prevent="onSubmit">
      <p v-if="errors.length">
          <b>Please correct the following errors(s):</b>
          <ul>
            <li v-for="error in errors">{{ error }}</li>
          </ul>
      </p>
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>

      <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>Would you recommend this product?</p>
        <label>
          Yes
          <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
          No
          <input type="radio" value="No" v-model="recommend"/>
        </label>

        <p>
          <input type="submit" value="Submit">
        </p>

    </form>
    </div>`,
  data(){
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: []
    }
  },
  methods: {
    onSubmit() {

      if ( this.name && this.review && this.rating && this.recommend) {
      let productReview = {
        name: this.name,
        review: this.review,
        rating: this.rating,
        recommend: this.recommend

      }
      eventBus.$emit('review-submitted', productReview)
      this.name = null
      this.review = null
      this.rating = null
      this.recommend = null
      this.errors = []
    }
    else {
      if(!this.name) this.errors.push("Name required")
      if(!this.review) this.errors.push("Review required")
      if(!this.rating) this.errors.push("Rating required")
      if(!this.recommend) this.errors.push("Recommendation required.")

    }
  }
  }
})

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: /*html*/`
  <div class="product">

    <div class="product-image">
      <img :src="image" />
    </div>

    <div class="product-info">
      <h1>{{ title }}</h1>
      <p v-if="inStock"
        :class="{ inStock: inStock}">In Stock</p>
      <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
      <p>Shipping: {{ shipping }}</p>
      <span v-if="onSale"
            :class="{ onSale: onSale}">On Sale!</span>
      <p>{{ sale }}</p>
      <a :href="link" target="_blank">More similar products</a>

      <ul class="size">
        <li v-for="size in sizes">{{ size }}</li>
      </ul>

      <product-details :details="details"></product-details>




      <div v-for="(variant, index) in variants"
           :key="variant.variantId"
           class="color-box"
           :style="{ backgroundColor: variant.variantColor }"
           @mouseover="updateProduct(index)">
      </div>

      <button @click="addToCart"
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }"
              >Add to cart
      </button>
      <button @click="removeFromCart"
              >Remove from cart
      </button>

      </div>
      <product-tabs :reviews="reviews"></product-tabs>
    </div>
  `,
  data() {
    return {
    brand: 'Top Notch',
    link: 'https://plnlp.co.uk',
    product: 'Socks',
    selectedVariant: 0,
    // image: '/img/greensock.jpg',
    // inStock: false,
    // onSale: true,
    details: ['80% cotton', '20% polyester', 'Gender-neutral'],
    sizes: ['s', 'm', 'l', 'xl'],
    variants: [
      {
        variantId: 2234,
        variantColor: 'green',
        variantImage: '../img/greensock.jpg',
        variantQuantity: 10,
        saleItem: true
      },
      {
        variantId: 2235,
        variantColor: 'blue',
        variantImage: '../img/bluesock.jpg',
        variantQuantity: 0,
        saleItem: false
      }
    ],
    reviews: []
  }
  },
  methods: {
    addToCart() {
      this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
    },
    updateProduct(index) {
      this.selectedVariant = index
      // console.log(index)
    },
    removeFromCart() {
      this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
    }
  },
  computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        sale() {
          if (this.onSale) {
            return this.brand + ' ' + this.product + ' are on sale!'
          }
            return  this.brand + ' ' + this.product + ' are not on sale'
        },
        image(){
            return this.variants[this.selectedVariant].variantImage
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },
        onSale(){
             return this.variants[this.selectedVariant].saleItem
        },
        shipping() {
          if (this.premium) {
            return "Free"
          }
            return 2.99
        }

  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview)
    })

  }

})

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: /*html*/`
  <div>

        <div>
          <span class="tab"
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
          >{{ tab }}</span>
        </div>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
                <li v-for="review in reviews">
                  <p>{{ review.name }}</p>
                  <p>Rating:{{ review.rating }}</p>
                  <p>{{ review.review }}</p>
                </li>
            </ul>
        </div>


        <product-review v-show="selectedTab === 'Make a Review'"></product-review>


  </div>
  `,
  data(){
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }

})


var app = new Vue({
  el: '#app',
  data: {
      premium: true,
      cart: []
    },
  methods: {
    updateCart(id) {
      this.cart.push(id)
    },
    decreaseCart(id) {
          for(var i = this.cart.length - 1; i >= 0; i--) {
            if (this.cart[i] === id) {
               this.cart.splice(i, 1);
            }
          }
    }
  }
})
