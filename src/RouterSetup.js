import React from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import Login from './Components/Login/Login';
// import SideBar from './Components/SideBar/SideBar';
import HomePage from './Components/HomePage/HomePage';
import Category from './Components/MenuDropdown/Category';
import HeaderManagement from './Components/HeaderManagement/HeaderManagement';
// import Imageupload from './Components/Imageupload/Imageupload';
import Dashboard from './Components/Dashboard/Dashboard';
import Componant from './Components/Componant/Componant';
import FooterManagement from './Components/FooterManagement/FooterManagement';
import CountryManagement from './Components/CountryManagement/CountryManagement';
import SiteStructureManagement from './Components/SiteStructureManagement/SiteStructureManagement';
import PageInfo from './Components/PageInfo/PageInfo';
import ProductInfo from './Components/ProductInfo/ProductInfo';
import ItemInfo from './Components/ItemInfo/ItemInfo';
import StepsInfo from './Components/360Mapping/StepsInfo';
import SceneInfo from './Components/360Mapping/SceneInfo';
import lightInfo from './Components/360Mapping/LightInfo';
import OBJInfo from './Components/360Mapping/OBJInfo';
import Menu from './Components/Menu/Menu';
import Responsiblity from './Components/Responsiblity/Responsiblity';
import UserManagement from './Components/UserManagement/UserManagement';
import SitesManagement from './Components/SitesManagement/SitesManagement';
import SocialMedia from './Components/SocialMedia/SocialMedia';
import Tag from './Components/Tag/Tag';
import Slug from './Components/Slug/Slug';
import ProValance from './Components/ProductValance/ValanceInfo';
import ProBracket from './Components/ProductBracket/BracketInfo';
import ProMotor from './Components/ProductMotor/MotorInfo';
import FilterType from './Components/FilterType/FilterType';
import Showroom from './Components/Showroom/Showroom';
//import ItemFamily from './Components/ItemFamily/ItemFamily';
import FamilyInfoList from './Components/FamilyInfo/FamilyInfoList';
import DeliveryZoneList from './Components/DeliveryZone/DeliveryZoneList';
import Campaign from './Components/Campaign/Campaign';
import DeliveryZoneCity from './Components/DeliveryZone/DeliveryZoneCity';
import CityList from './Components/CountryManagement/CityList';
import AreaList from './Components/CountryManagement/AreaList';
import Tabby from './Components/Tabby/Tabby';
import ColorList from './Components/ColorInfo/ColorList';
import BrandList from './Components/BrandInfo/BrandList';
import Instagram from './Components/Instagram/Instagram';
import Collection from './Components/Collection/Collection';
import Translation from './Components/Translation/Translation';
import Ecard from './Components/Ecard/Ecard';
import Language from './Components/Language/Language';
import Uploads from './Components/Uploads/';
import QueryExecutions from './Components/QueryExecutions/';
// import Blog from './Components/Blog/';
// import BlogCategory from './Components/Blog/Category/';



import { connect } from 'react-redux';
function RouterSetup(props) {

  const user_id = props.user_id;
  const auth_token = props.auth_token;
  if (user_id === null && auth_token === null) {
    return (
      <div className="App">
        <Login />
      </div>
    );
  } else {
    return (
      <Switch>
        <Route exact path="/" render={() => (
          props.user_id !== '' ? <Redirect to="/Dashboard" /> : <Login />
        )} />
        <Route exact path="/HomePage" component={HomePage} />
        {/* <Route exact path="/BannerSetup" component={Imageupload} /> */}
        <Route exact path="/Dashboard" component={Dashboard} />
        <Route exact path="/Component" component={Componant} />
        <Route exact path="/Category" component={Category} />
        <Route exact path="/HeaderManagement" component={HeaderManagement} />
        <Route exact path="/Footer" component={FooterManagement} />
        <Route exact path="/Country" component={CountryManagement} />
        <Route exact path="/Structure" component={SiteStructureManagement} />
        <Route exact path="/PageInfo" component={PageInfo} />
        <Route exact path="/StepsInfo" component={StepsInfo} />
        <Route exact path="/sceneInfo" component={SceneInfo} />
        <Route exact path="/ProductInfo" component={ProductInfo} />
        <Route exact path="/iteminfo" component={ItemInfo} />
        <Route exact path="/lightInfo" component={lightInfo} />
        <Route exact path="/objInfo" component={OBJInfo} />
        <Route exact path="/Menu" component={Menu} />
        <Route exact path="/Resp" component={Responsiblity} />
        <Route exact path="/User" component={UserManagement} />
        <Route exact path="/Site" component={SitesManagement} />
        <Route exact path="/Social" component={SocialMedia} />
        <Route exact path="/tag" component={Tag} />
        <Route exact path="/Slug" component={Slug} />
        <Route exact path="/ProValance" component={ProValance} />
        <Route exact path="/ProBracket" component={ProBracket} />
        <Route exact path="/ProMotor" component={ProMotor} />
        <Route exact path="/filtertype" component={FilterType} />
        <Route exact path="/showroom" component={Showroom} />
        {/* <Route exact path="/itemfamily" component={ItemFamily} /> */}
        <Route exact path="/familyinfo" component={FamilyInfoList} />
        <Route exact path="/deliveryzone" component={DeliveryZoneList} />
        <Route exact path="/deliveryzonecity" component={DeliveryZoneCity} />
        <Route exact path="/campaign" component={Campaign} />
        <Route exact path="/city" component={CityList} />
        <Route exact path="/area" component={AreaList} />
        <Route exact path="/tabby" component={Tabby} />
        <Route exact path="/color" component={ColorList} />
        <Route exact path="/brand" component={BrandList} />
        <Route exact path="/instagram" component={Instagram} />
        <Route exact path="/collection" component={Collection} />
        <Route exact path="/translation" component={Translation} />
        <Route exact path="/ecard" component={Ecard} />
        <Route exact path="/Language" component={Language} />
        <Route exact path="/uploads" component={Uploads} />
        <Route exact path="/queryexecutions" component={QueryExecutions} />
        {/* <Route exact path="/blog" component={Blog} /> */}
        {/* <Route exact path="/blogCategory" component={BlogCategory} /> */}


      </Switch>
    )
  }
}
//export default RouterSetup;
const mapStateToProps = state => {
  return state.Reducers;
}
export default connect(mapStateToProps, null)(RouterSetup);