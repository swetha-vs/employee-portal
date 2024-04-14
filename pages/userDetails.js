import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { Button, Image } from "antd";
import { DoubleLeftOutlined, TwitterOutlined, InstagramOutlined, YoutubeOutlined, CloudFilled, GooglePlusOutlined, FacebookOutlined } from '@ant-design/icons'
import { useNavigate } from "react-router-dom";

function DetailsUser() {
    const { id } = useParams()
    const [userDetail, setUserDetail] = useState([])
    const navigate = useNavigate()

    const fetchData = async () => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, `userdetails`, id);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                const jsDate = data.dob ? data.dob.toDate() : new Date();
                const dateString = jsDate?.toLocaleDateString();
                setUserDetail({
                    name: data.name,
                    age: data.age,
                    dob: dateString,
                    email: data.email,
                    place: data.place,
                    phone: data.phone,
                    profile: data.profile
                });
            } else {
                console.error('User not found');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    useEffect(() => {
        fetchData()
    }, [])

    const backButton = () => {
        navigate("/")
    }

    return (
        <div className="employeedetails" >

            <div className="card" >
                <div className="headerdiv" >
                    <div className="employee" >
                        <Button className="backbtn" onClick={backButton} icon={<DoubleLeftOutlined />} ></Button>
                        <h1>Employee Details</h1>
                    </div>

                    <Image preview={false} src={userDetail.profile || 'https://www.w3schools.com/w3css/img_avatar.png'} className="image" />

                </div>
                <div className="bodydiv" >
                    <div className="firstdiv" >
                        <h3>{userDetail.name}</h3>
                        <p>{userDetail.age} - {userDetail.dob} - {userDetail.place}</p>
                        <p className="mail" >{userDetail.email}</p>
                        <p className="phone" >{userDetail.phone}</p>
                        <p className="icons" ><InstagramOutlined />&emsp;<FacebookOutlined />&emsp;<TwitterOutlined />&emsp;<YoutubeOutlined />&emsp;<CloudFilled />&emsp;<GooglePlusOutlined /> </p>
                        <div className="footerdiv">
                            <div className="fdiv">
                                <p>2K</p>
                                <h2>Following</h2>
                            </div>
                            <div className="sdiv">
                                <p>30K</p>
                                <h2>Followers</h2>
                            </div>
                            <div className="tdiv">
                                <p>50K</p>
                                <h2>Views</h2>
                            </div>

                        </div>
                    </div>
                    <div className="secdiv" >
                        <h1>About</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
                    </div>
                </div>
            </div>

        </div>
    )
}
export default DetailsUser


