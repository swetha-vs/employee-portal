import { Button, Input, Modal, Form, DatePicker, Table, Upload, Image, message, Avatar } from "antd";
import React from "react";
import { UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState, useEffect } from "react";
import { auth, storage } from './ConfigUser'
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, onSnapshot, setDoc, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import moment from 'moment';
import './User.scss'
import FormItem from "antd/es/form/FormItem";

function FormUser() {
    const [form] = Form.useForm();
    const [isOpenmodal, setIsOpenmodal] = useState(false)
    const [page, setPage] = useState(2)
    const [users, setUsers] = useState([])
    const [username, setUsername] = useState('')
    const [file, setFile] = useState(null)
    const [profile, setProfile] = useState('')
    const [loading, setLoading] = useState(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isEditModal, setIsEditModal] = useState(false)
    const [editedData, setEditedData] = useState(null);
    const history = useNavigate();
    const [editImage, setEditImage] = useState()
    const [iseditToggle, setIsEditToggle] = useState(false)

    const createUser = () => {
        setIsOpenmodal(true)
        setPage(2)
    }

    const checkField = () => {
        const value = form.getFieldValue();
        setIsButtonDisabled(!value.name || !value.email || !value.password || !value.confirmPassword);
    };

    const beforeUpload = (file) => {
        setFile(file);
        return false;
    };

    const handleDelete = async (record, e) => {
        e.stopPropagation()
        const db = getFirestore()
        const itemDoc = doc(db, 'userdetails', record.id)
        try {
            await deleteDoc(itemDoc)
        } catch (err) {
            console.error(err)
        }
    }

    const handleEdit = async (text, record, e) => {
        e.stopPropagation();
        console.log(record.profile)
        let obj = {
            uid: '-1',
            status: 'done',
            url: record.profile || 'https://www.w3schools.com/w3css/img_avatar.png',
        }
        setEditImage(record.profile?[obj]:null)
        setIsEditModal(true)
        form.setFieldsValue({
            id: record.id,
            name: record.name,
            age: record.age,
            dob: moment(record.dob),
            place: record.place,
            phone: record.phone,
            profile: record.profile,
        });
    }


    const saveEditChanges = async (values) => {
        console.log(values, 'values')

        const db = getFirestore();
        const docRef = doc(db, 'userdetails', values.id);
        const editage = parseInt(values.age)
        const dateTimestamp = new Date(values.dob);

        let downloadURL = "";
        if(editImage){
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);
        downloadURL = await getDownloadURL(storageRef);
        }
        try {
            await updateDoc(docRef, {
                name: values.name,
                age: editage,
                place: values.place,
                phone: values.phone,
                dob: dateTimestamp,
                profile: downloadURL,
            });
            setIsEditModal(false)
            message.success("User updated Successfully")
        } catch (e) {
            console.error('Error updating document: ', e);
        }
    };

    const onFinish = async (values) => {
        const db = getFirestore();
        const nage = parseInt(values.age)
        const nphone = (values.phone)
        const dateTimestamp = new Date(values.dob);
        setLoading(true)
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.confirmPassword)
                .then(async (userCredential) => {
                    let downloadURL = "";
                    if (file) {
                        const storageRef = ref(storage, `images/${file.name}`);
                        await uploadBytes(storageRef, file);
                        downloadURL = await getDownloadURL(storageRef);
                       
                    }

                    try {
                        const user = userCredential.user;
                        const docRef = await setDoc(doc(db, 'userdetails', user.uid), {
                            name: values.name,
                            email: values.email,
                            confirmPassword: values.confirmPassword,
                            age: nage,
                            dob: dateTimestamp,
                            place: values.place,
                            phone: nphone,
                            language: values.language,
                            profile: downloadURL,
                        });
                        setTimeout(() => {
                            setLoading(false)
                            setIsOpenmodal(false)
                        }, 2000)
                    } catch (error) {
                        console.log(error)
                    }

                    fetchData();
                    form.resetFields()
                    message.success("User Created Successfully")
                })
                .catch((error) => {
                    console.log(error)
                });
        } catch (err) {
            console.error(err)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        const db = getFirestore();
        const itemsCollection = collection(db, 'userdetails');
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const currentUser = user;
                const userDocRef = doc(db, 'userdetails', currentUser.uid);
                const docSnap = getDoc(userDocRef);
                docSnap.then((doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        const name = userData.name;
                        setUsername(name)
                        const profilePicUrl = userData.profile;
                        setProfile(profilePicUrl)
                    } 
                });

                const unsubscribeSnapshot = onSnapshot(itemsCollection, (snapshot) => {
                    const fetchedItems = snapshot.docs.map((doc) => {
                        const data = doc.data();
                        const jsDate = data?.dob ? data?.dob.toDate() : new Date();
                        const dateString = jsDate?.toLocaleDateString();
                        return {
                            id: doc.id,
                            ...data,
                            dob: dateString,
                        };
                    });
                    setUsers(fetchedItems);
                });
                return () => unsubscribeSnapshot();
            }
        });
        return () => unsubscribe();
    };

    const columns = [
        {
            dataIndex: 'name',
            title: 'name',
            key: 'name',
            render: (text, image) => (
                <div style={{ display: "flex", alignItems: "center" }} >
                    <Image preview={false} src={image.profile || 'https://www.w3schools.com/w3css/img_avatar.png'}
                        style={{ borderRadius: "50%", height: '50px', width: '50px', objectFit: 'cover' }} />
                    <p style={{ marginLeft: "1rem" }} >{text}</p>
                </div>
            ),
        },
        {
            dataIndex: 'age',
            title: 'Age',
            key: 'age',
        },
        {
            dataIndex: 'dob',
            title: 'Date of Birth',
            key: 'dob',
        },
        {
            dataIndex: 'email',
            title: 'Mail',
            key: 'email',
        },
        {
            dataIndex: 'place',
            title: 'Place',
            key: 'place',
        },
        {
            dataIndex: 'phone',
            title: 'Phone Number',
            key: 'phone',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => {
                return (
                    <div>
                        <Button onClick={(e) => handleEdit(text, record, e)} icon={<EditOutlined />} style={{ marginRight: "10px" }}></Button>
                        <Button onClick={(e) => handleDelete(record, e)} icon={<DeleteOutlined />}></Button>
                    </div>
                )
            },
        },
    ]

    const handleRowClick = (record) => {
        history(`/DetailsUser/${record.id}`);
    };

    const signout = async () => {
        try {
            await signOut(auth)
            history("/login")
            alert("Successfully signed out!!")
        } catch (err) {
            console.error(err)
        }
    }

    const cancelForm = () => {
        setIsOpenmodal(false)
        form.resetFields()
        setIsButtonDisabled(true)
    }

    const editCloseModal = () => {
        setIsEditModal(false)
        form.resetFields()

    }

    const handleUploadRemove = async (file) => {
        setIsEditToggle(true)
        const storageRef = ref(storage, file.url);

        try {
            await deleteObject(storageRef);
            setEditImage(null)
            console.log('File deleted successfully');


        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const profileOnchange = ({ fileList: editImage }) => {
        setEditImage(editImage);
    };

    return (
        <div>
            <div className="header" >
                <h1>Employee List</h1>

                <div>
                    <div className="imagename" >
                        <Image preview={false} src={profile || 'https://www.w3schools.com/w3css/img_avatar.png'} width={50} className="image" />
                        <h3>Hello {username} !</h3>
                    </div>
                    <Button className="btn" onClick={createUser}>Create User</Button>
                    <Button className="btn" onClick={signout} >Sign Out</Button>
                </div>
                <Modal open={isOpenmodal} width={520} style={{ height: "500px" }}
                    onCancel={cancelForm}
                    cancelButtonProps={{ style: { display: 'none' } }}
                    okButtonProps={{ style: { display: 'none' } }} >

                    <Form form={form} layout="horizontal" onFinish={onFinish}
                        style={{ height: "500px" }}

                        labelCol={{
                            flex: '110px',
                            span: 4
                        }}
                        labelAlign="left"
                        labelWrap
                        wrapperCol={{
                            flex: 1,
                        }}
                        colon={false}
                    >
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, zIndex: page == 1 ? -1 : 0 }}>
                                <h2>Employee Details (1/2)</h2>
                                <h3>Personal Information</h3>

                                <Form.Item label='Name' name='name' className="fpage"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Enter your name',
                                        },
                                        {
                                            pattern: /^[A-Za-z\s'-]+$/,
                                            message: 'Invalid characters in name.',
                                        },
                                        {
                                            min: 2,
                                            message: 'Name must be at least 2 characters long',
                                        },
                                    ]}
                                    hasFeedback  >
                                    <Input onChange={() => checkField('name')} placeholder="Enter your name" />
                                </Form.Item>

                                <Form.Item label='Email' name='email' className="fpage"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Email is required',
                                        },
                                        {
                                            pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/,
                                            message: 'Invalid email format. Please enter a valid email address.',
                                        },
                                    ]}
                                    hasFeedback >
                                    <Input onChange={() => checkField('email')} placeholder="Enter your mail address" />
                                </Form.Item>

                                <Form.Item label='Password' name='password' className="fpage"
                                    rules={[
                                        { required: true, }
                                    ]}
                                    hasFeedback >
                                    <Input.Password onChange={() => checkField('password')} placeholder="Enter your password" type="password" />
                                </Form.Item>

                                <Form.Item className="fpage" label='Confirm Password' name='confirmPassword' dependencies={['password']}
                                    rules={[
                                        { required: true, },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve()
                                                }
                                                return Promise.reject('Password that you enterd does not match')
                                            }
                                        })
                                    ]}
                                    hasFeedback >
                                    <Input onChange={() => checkField('confirmPassword')} placeholder="Enter your password" type="password" />
                                </Form.Item>
                                <div className="pagefooter">
                                    <Button onClick={() => setIsOpenmodal(false)} >Cancel</Button>
                                    <Button disabled={isButtonDisabled} onClick={() => setPage(page == 1 ? 2 : 1)} className="nextbtn">Next</Button>
                                </div>
                            </div>

                            <div style={{ position: 'absolute', top: 0, zIndex: page == 2 ? -1 : 0 }}>
                                <h2>Employee Details(2/2)</h2>
                                <h3>More About You</h3>

                                <div className="agedob" >
                                    <Form.Item label='Age' name='age'
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Enter your age!',
                                            },
                                            {
                                                pattern: /^[0-9]+$/,
                                                message: 'Enter a valid age (numeric characters only)',
                                            },
                                            {
                                                validator: (_, value) => {
                                                    if (value < 18) {
                                                        return Promise.reject('You must be at least 18 years old');
                                                    }
                                                    if (value > 70) {
                                                        return Promise.reject('Enter a valid age');
                                                    }
                                                    return Promise.resolve();
                                                },
                                            },
                                        ]}
                                        hasFeedback
                                    >
                                        <Input className="age" placeholder="Enter your age" />
                                    </Form.Item>

                                    <Form.Item label='DOB' name='dob' className="dob" >
                                        <DatePicker />
                                    </Form.Item>
                                </div>

                                <Form.Item label='Place' name='place'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Place is required',
                                        },
                                        {
                                            pattern: /^[A-Za-z\s'-]+$/,
                                            message: 'Invalid characters.',
                                        },
                                    ]}
                                    hasFeedback >
                                    <Input placeholder="Enter your place" />
                                </Form.Item>

                                <Form.Item label='Phone Number' name='phone'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Entetr your phone number!',
                                        },
                                        {
                                            pattern: /^[0-9]{10}$/,
                                            message: 'Enter a valid phone number.',
                                        },
                                    ]}
                                    hasFeedback >
                                    <Input placeholder="Enter your phone number" />
                                </Form.Item>

                                <Form.Item label='Profile' name='profile'
                                >
                                    <Upload listType="picture" beforeUpload={beforeUpload} maxCount={1} >
                                        <Button icon={<UploadOutlined />}>Upload Image</Button>
                                    </Upload>
                                </Form.Item>

                                <Form.Item label='Language' name='language'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Language is required',
                                        },
                                        {
                                            pattern: /^[A-Za-z\s'-]+$/,
                                            message: 'Invalid characters.',
                                        },
                                    ]}
                                    hasFeedback  >
                                    <Input placeholder="Enter your native language" />
                                </Form.Item>
                                <div className="formfooter" >
                                    <Button onClick={() => setPage(page == 2 ? 1 : 2)}>Back</Button>
                                    <Button loading={loading} className="postbtn" type="primary" htmlType="submit">Submit</Button>
                                </div>
                            </div>
                        </div>
                    </Form>
                </Modal>
            </div>

            <div>
                <Table dataSource={users}
                    columns={columns}
                    onRow={(record) => ({ onClick: () => handleRowClick(record) })}>
                </Table>

                <Modal open={isEditModal}
                    onCancel={editCloseModal}
                    cancelButtonProps={{ style: { display: 'none' } }}
                    okButtonProps={{ style: { display: 'none' } }}>
                    <Form className="editmodal" form={form} onFinish={saveEditChanges}
                        labelCol={{
                            flex: '110px',
                            span: 3
                        }}
                        labelAlign="left"
                        labelWrap
                        wrapperCol={{
                            flex: 1,
                        }}
                        colon={false} >
                        <h3>Edit User</h3>

                        <Form.Item name='profile'>
                            <div className="profile" >
                                {editImage 
                                    ? (
                                        <div>
                                            <Upload 
                                                preview={false}
                                                onRemove={handleUploadRemove}
                                                listType="picture-circle"
                                                fileList={editImage}
                                                beforeUpload={beforeUpload}
                                                maxCount={1}
                                            >
                                            </Upload>

                                        </div>
                                    ) :
                                    (
                                        <Upload 
                                        beforeUpload={beforeUpload}
                                            preview={false}
                                            onChange={profileOnchange}
                                            listType="picture-circle"
                                            fileList={[]}
                                            maxCount={1}
                                        >
                                            <EditOutlined />
                                        </Upload>
                                    )}
                            </div>
                        </Form.Item>

                        <FormItem label="Name" name='name'>
                            <Input placeholder="Enter your Name"
                            />
                        </FormItem>

                        <div className="editagedob">
                            <FormItem label="Age" name='age'  >
                                <Input className="editage" placeholder="Enter your age" />
                            </FormItem>
                            <FormItem label="DOB" name='dob' className="doblabel" >
                                <DatePicker className="dob" />
                            </FormItem>
                        </div>
                        <FormItem label="Place" name='place'>
                            <Input placeholder="Enter your Place" />
                        </FormItem>
                        <FormItem label="Phone number" name='phone'>
                            <Input placeholder="Enter your Phone number" />
                        </FormItem>

                        <FormItem name='id' style={{ display: "none" }}  >
                            <Input />
                        </FormItem>

                        <div className="editModalFooter">
                            <Button onClick={editCloseModal}>Cancel</Button>
                            <Button htmlType="submit">Save Changes</Button>
                        </div>
                    </Form>
                </Modal>
            </div>
        </div>
    )
}
export default FormUser