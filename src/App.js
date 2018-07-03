import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation' 
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Particles from 'react-particles-js'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'

const particlesOptions = {
  particles: {
    number: {
      value: 200,
      density:{
        enable:true,
        value_area: 800
      }
    }},
  }

const initialState = {
      input: '',
      imageUrl: '',
      box:{},
      route:'Signin',
      isSignedin: false,
      user:{
        id: '',
        name:'',
        email:'',
        password:'',
        entries:0,
        joined: ''  
      }
  }
class App extends Component {

  constructor(){
    super();
    this.state = initialState;
  }
  loadUser = (data) =>{

    this.setState({user:  
        {
        id: data.id, 
        name: data.name,
        email: data.email, 
        password: data.password, 
        entries: data.entries,
        joined: data.joined
        }})

    }
  calculateFaceLocation = (data) =>{

    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;

    const image = document.getElementById('input_image');
    
    const width = Number(image.width);

    const height = Number(image.height);

    console.log(height , width);

    return {

      leftCol: clarifaiFace.left_col * width ,

      topRow: clarifaiFace.top_row * height ,

      rightCol: width - (clarifaiFace.right_col * width),

      bottomRow : height - (clarifaiFace.bottom_row * height)
 
    }
  }

  displayFaceBox = (box) => {

    this.setState({box:box});
  }
  
  onInpuChange = (event) => {
    this.setState({input: event.target.value});
  }

  onRouteChange = (route) => {

    if(route === 'signout'){
      this.setState(initialState);
    }
    else if(route === 'home'){
      this.setState({isSignedin:true});
      }
    this.setState({route: route}); 
  }

  onButtonSubmit = () => {
    
    this.setState({imageUrl: this.state.input});
    fetch('https://fathomless-spire-64614.herokuapp.com/imageurl',{
          method:'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          input: this.state.input
        })
        }) 
      .then( response => response.json())
    .then( response =>{
     if(response){
      fetch('https://fathomless-spire-64614.herokuapp.com/image',{
          method:'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          id: this.state.user.id
        })
        })
      .then(response =>response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user , {entries: count }))
      })
      .catch(console.log);

    }
     this.displayFaceBox(this.calculateFaceLocation(response)) 
    })
    .catch( err => console.log(err));
  }

  render() {
    
      const { isSignedin , imageUrl, route , box  } = this.state;
      
      return (
      <div className="App">
        <Particles className='particles'
              params={particlesOptions}
              />
        <Navigation isSignedin = {isSignedin} onRouteChange =  {this.onRouteChange } />
        { route === 'home'  
        ?
        <div> 
        <Logo />
        <Rank name = {this.state.user.name} entries = {this.state.user.entries }/>
        <ImageLinkForm 
        onInpuChange= {this.onInpuChange} 
        onButtonSubmit = {this.onButtonSubmit}
        />
        <FaceRecognition box = {box} imageUrl={imageUrl} />
        </div>
        :(route === 'Signin'
        ?
        <Signin onRouteChange = {this.onRouteChange } loadUser = {this.loadUser} />
        :<Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange }/>
        )
      }
      </div>
    );
  }
}

export default App;
