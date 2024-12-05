<template>
  <div id="app">
    <h1>Mars Rover</h1>
    
    <div class="coordinates-container">
      <div class="coordinate-input">
        <label for="coordinateX">X coordinate</label>
        <input v-model="coordinateX" inputmode="numeric" placeholder="Enter the X coordinate" @input="validateCoordinate('X')"/>
      </div>
      <div class="coordinate-input">
        <label for="coordinateY">Y coordinate</label>
        <input v-model="coordinateY" inputmode="numeric" placeholder="Enter the Y coordinate" @input="validateCoordinate('Y')"/>
      </div>

      <div class="buttons-container">
        <button @click="createRover">Create Rover</button>
        <button @click="processRoverInstructions()">Move Rovers</button>
        <button @click="destroyRovers">Destroy Rovers</button>
      </div>
    </div>

    <div v-for="(inputs, index) in roversList" :key="index" class="rover-container">
      <div class="rover-input">
        <label :for="'initialPosition-' + index">Landing Position {{index + 1}}</label>
        <input 
          :id="'initialPosition-' + index"
          type="text" 
          v-model="inputs.initialPosition" 
          placeholder="Enter the starting position (X, Y, N)" 
          @blur="validateInitialPosition(index)" 
        />
        <span v-if="inputs.errorPosition" class="error">{{inputs.errorPosition}}</span>
      </div>

      <div class="rover-input">
        <label :for="'instructions-' + index">Rover Instructions {{index + 1}}</label>
        <input
          :id="'instructions-' + index"
          type="text" 
          v-model="inputs.instructions" 
          placeholder="Moving instructions" 
          @blur="validateInstructions(index)"
        />
        <span v-if="inputs.errorInstructions" class="error">{{inputs.errorInstructions}}</span>
      </div>

      <div class="rover-output">
        <p>{{inputs.finalPosition}}</p>
      </div>
    </div>
    
    <Toast v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
  import axios from 'axios';
  import Toast from './components/Toast.vue';
  import './styles/App.css';

  export default {
    name: 'App',
    components: {
      Toast
    },
    data() {
      return {
        apiUrl: process.env.VUE_APP_API_URL,
        coordinateX: '', 
        coordinateY: '', 
        responseMessage: '',
        showToast: false,
        toastMessage: '',
        toastType: 'success',
        roversList: [],
        responseData: null
      };
    },
    methods: {
      createRover() {
        this.roversList.push({
          initialPosition: '',
          instructions: '',
          finalPosition: 'Posição final:',
          errorPosition: '', 
          errorInstructions: '', 
          isValidPosition: false,
          isValidInstructions: false
        });
      },
      validateCoordinate(type) {
        if (type === 'X') {
          this.coordinateX = String(this.coordinateX || '').replace(/[^0-9]/g, '');
        } else if (type === 'Y') {
          this.coordinateY = String(this.coordinateY || '').replace(/[^0-9]/g, '');
        }
      },
      validateInitialPosition(index) {
        const regex = /^\d+\s*[, ]\s*\d+\s*[, ]\s*[NSEWnsew]$/;
        const inputs = this.roversList[index];

        if (!regex.test(inputs.initialPosition.trim())) {
          inputs.errorPosition = "Invalid input. Use formats: X, Y, N or X Y N (e.g. 0, 0, N or 0 0 N)";
          inputs.isValidPosition = false;
          return;
        }

        const parts = inputs.initialPosition.trim().split(/[, ]+/);
        const x = parseInt(parts[0], 10);
        const y = parseInt(parts[1], 10);

        if (x > this.coordinateX || y > this.coordinateY) {
          inputs.errorPosition = `X and Y coordinates must be within the limit (${this.coordinateX}, ${this.coordinateY}).`;
          inputs.isValidPosition = false;
          return;
        }

        inputs.errorPosition = "";
        inputs.isValidPosition = true;
      },
      validateInstructions(index) {
        const inputs = this.roversList[index];
        const regex = /^([LRMlrm])([ ,]*([LRMlrm]))*$/;

        if (!regex.test(inputs.instructions.trim())) {
          inputs.errorInstructions = "Invalid instructions. Use only 'L', 'R', 'M' separated by commas or spaces.";
          inputs.isValidInstructions = false;
          return;
        }

        inputs.errorInstructions = "";
        inputs.isValidInstructions = true;
      },
      async processRoverInstructions() {
        let enable = true;
        for (let i = 0; i < this.roversList.length; i++) {
          const inputs = this.roversList[i];
         
          this.validateInitialPosition(i);
          this.validateInstructions(i);

          if(!inputs.isValidPosition || !inputs.isValidInstructions){
            enable = false;
          }
        }

        if(!enable) return;

        for (let i = 0; i < this.roversList.length; i++) {
          this.roversList[i].finalPosition = "Moving the rover...";

          const inputs = this.roversList[i];
          try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const response = await axios.post(`${this.apiUrl}/processRoverInstructions`, {
              initialPosition: inputs.initialPosition, 
              instructions: inputs.instructions,
              maxCoordinateX: this.coordinateX,
              maxCoordinateY: this.coordinateY
            });

            this.roversList[i].finalPosition = response.data.message;
          } catch (error) {
            console.error("Error sending data:", error);
            this.showToastMessage(error.response?.data?.message || 'Error sending data', 'error');
          }
        }
      },
      async destroyRovers() {
        this.roversList = [];
        this.showToastMessage('Rovers successfully destroyed!', 'success');
      },
      showToastMessage(message, type) {
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;

        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      }
    }
  };
</script>
