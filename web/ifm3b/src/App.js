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
import Amenities from "./elements/Amenities";
import Rooms from "./elements/Rooms";
import RoomById from "./elements/RoomById";
import EditRoom from "./elements/EditRoom";
import AddRoom from "./elements/AddRoom";
import History from "./elements/History";
import ClerkAddStock from "./elements/ClerkAddStock";
import ClerkViewStatus from "./elements/ClerkViewStatus";
import EmpHistory from "./elements/EmpHistory";
import UpcomingBookings from "./elements/UpcomingBookings";
import EmpUpdateBooking from "./elements/EmpUpdateBooking";
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
          <Route path="/room/:id" element={<RoomById/>} />
          <Route path="/editroom/:id" element={<EditRoom/>} />
          <Route path="/addroom" exact element = {<AddRoom/>}/>
          <Route path="/bookroom" exact element = {<BookRoom/>}/>

          <Route path="/stockamenities" exact element = {<StockAmenities/>}/>
          <Route path="/amenities" exact element = {<Amenities/>}/>
          <Route path="/hr" exact element = {<HR/>}/>

          <Route path="/emphistory" exact element = {<EmpHistory/>}/>
          <Route path="/upcomingbookings" exact element = {<UpcomingBookings/>}/>
          <Route path="/empUpdateBooking/:id" element={<EmpUpdateBooking/>} />

          <Route path="/report" exact element = {<Report/>}/>
          <Route path="/profile" exact element = {<Profile/>}/>
          <Route path="/profileupdate" exact element = {<ProfileUpdate/>}/>
          
          <Route path="/statusupdate" exact element = {<StatusUpdate/>}/>
          <Route path="/history" exact element = {<History/>}/>
          <Route path="/clerkaddstock/:id" element={<ClerkAddStock/>} />
          <Route path="/clerkviewstatus/:id" element={<ClerkViewStatus/>} />
          
        </Routes>
    </div>
  );
}

export default App;
