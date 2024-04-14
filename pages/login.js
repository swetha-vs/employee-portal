import React, { useContext } from 'react'
import './User.scss'
import { useState} from 'react'
import { auth } from './ConfigUser'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Form } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "./AuthContext";


function AuthUser() {
    const [loading, setLoading] = useState(false)
    const { login } = useContext(AuthContext);

    const history = useNavigate()
    const submit = async (values) => {
        const mail = await signInWithEmailAndPassword(auth, values.email, values.password)
            .then((userCredential) => {
                const user = userCredential.user;
                setLoading(true)
                setTimeout(() => {
                    setLoading(false)
                    login();
                    history('/')
                }, 2000)
 
            })
            .catch((error) => {
                alert("User Not Found !!")
                const errcode=error.errcode
                const errmsg=error.message
            });
    }

    return (
        <div className='imgph' >
            <div >
                <img src='https://glassen.net/wp-content/uploads/2021/01/Office365MFA-1073x848.jpg' />
            </div>
            <div className='mobilediv' >
                <div>
                    <Form layout="vertical" onFinish={submit} >
                        <Form.Item label='Enter your Email Id' name='email'  >
                            <Input placeholder="Enter your Email Id" />
                        </Form.Item>

                        <Form.Item label='Enter your Password' name='password'  >
                            <Input placeholder="Enter your Password" type='password' />
                        </Form.Item>
                        <Button loading={loading} htmlType='submit' >Submit</Button>
                    </Form>
                </div>
            </div>
        </div>
    )
}
export default AuthUser         