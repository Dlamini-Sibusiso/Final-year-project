import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import Nav from "./elements/Nav";
import Login from "./elements/Login";
import Register from "./elements/Register";
import RegisterStart from "./elements/RegisterStart";
import Home from "./elements/Home";
import Report from "./elements/Report";
import Profile from "./elements/Profile";
import ProfileUpdate from "./elements/ProfileUpdate";
import HR from "./elements/HR";
import StockAmenities from "./elements/StockAmenities";
import Rooms from "./elements/Rooms";
import AddRoom from "./elements/AddRoom";
import History from "./elements/History";
import EmpHistory from "./elements/EmpHistory";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import StatusUpdate from "./elements/StatusUpdate";
import BookRoom from "./elements/BookRoom";

function App() {
  return (
    <BrowserRouter>
      <Appcontent/>
    </BrowserRouter>
  )
}

const Appcontent = () => {
  const location = useLocation();

  //Don't show Nav on Login, Register and RegisterStart
const hideNavRoutes = ['/','/register','/registerstart'];
const showNav = !hideNavRoutes.includes(location.pathname);            

  return (
    <div >
        {showNav && <Nav />}
        <Routes>
          <Route path="/" exact element = {<Login/>}/>
          <Route path="/registerstart" element = {<RegisterStart/>}/>  
          <Route path="/register" element = {<Register/>}/>
          <Route path="/home" exact element = {<Home/>}/>

          <Route path="/rooms" exact element = {<Rooms/>}/>
          <Route path="/addroom" exact element = {<AddRoom/>}/>

          <Route path="/report" exact element = {<Report/>}/>
          <Route path="/hr" exact element = {<HR/>}/>
          <Route path="/stockamenities" exact element = {<StockAmenities/>}/>
          <Route path="/profile" exact element = {<Profile/>}/>
          <Route path="/profileupdate" exact element = {<ProfileUpdate/>}/>
          <Route path="/history" exact element = {<History/>}/>
          <Route path="/emphistory" exact element = {<EmpHistory/>}/>
          <Route path="/statusupdate" exact element = {<StatusUpdate/>}/>
          <Route path="/bookroom" exact element = {<BookRoom/>}/>
        </Routes>
    </div>
  );
}

export default App;
