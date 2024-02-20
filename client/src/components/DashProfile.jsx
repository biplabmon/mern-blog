import { Alert, Button, Modal, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateStart, updateSuccess, updateFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signoutSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { HiInformationCircle } from 'react-icons/hi';


const DashProfile = () => {
    const { currentUser, error } = useSelector(state => state.user);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
    const [imageFileUploadError, setImageFileUploadError] = useState(null);
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);
    const [formData, setFormData] = useState({});
    const [showModal, setShowModal] = useState(false);
    const filePickerRef = useRef(null);

    const dispatch = useDispatch();

    // console.log(imageFileUploadProgress, imageFileUploadError)
    const handleImageChange = event => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setImageFileUrl(URL.createObjectURL(file));     // create a new URL(blob url) for the file
        }
    };
    // console.log(imageFile, imageFileUrl)

    useEffect(() => {
        if (imageFile) {
            uploadImage();
        }
    }, [imageFile]);

    const uploadImage = async () => {
        // console.log('Uploading image...');

        setImageFileUploading(true);
        setImageFileUploadError(null);
        // upload image on firebase
        const storage = getStorage(app);
        const fileName = new Date().getTime() + imageFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        // below process is for get the value of file uploading task
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImageFileUploadProgress(progress.toFixed(0));
            },
            (error) => {
                setImageFileUploadError("Couldn't upload image (File must be less than 2MB)");
                setImageFileUploadProgress(null);
                setImageFile(null);
                setImageFileUrl(null);
                setImageFileUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
                    setImageFileUrl(downloadUrl);
                    setFormData({ ...formData, profilePicture: downloadUrl });
                    setImageFileUploading(false);
                })
            }
        )

    };

    const handelChange = event => {
        setFormData({
            ...formData,
            [event.target.id]: event.target.value.trim()
        });
    };

    const handelSubmit = async (event) => {
        event.preventDefault();
        setUpdateUserSuccess(null);
        setUpdateUserError(null);

        if (Object.keys(formData).length === 0) {
            setUpdateUserError("No changes were made")
            return;
        };

        if (imageFileUploading) {
            setUpdateUserError("Please wait for image upload")
            return;
        }

        try {
            dispatch(updateStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) {
                dispatch(updateFailure(data.message));
                setUpdateUserError(data.message);
            } else {
                dispatch(updateSuccess(data));
                setUpdateUserSuccess("User's profile updated successfully")
            }

        } catch (error) {
            dispatch(updateFailure(error.message));
            setUpdateUserError(error.message);
        };
    };

    const handelDeleteUser = async (event) => {
        setShowModal(false);
        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': "application/json" }
            });

            const data = await res.json();
            if (!res.ok) {
                dispatch(deleteUserFailure(data.message));
            } else {
                dispatch(deleteUserSuccess(data))
            }
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
        }
    };

    const handelSignout = async () => {
        try {
            const res = await fetch('/api/user/signout', {
                method: 'POST',
            });

            const data = await res.json();
            if (!res.ok) {
                console.log(data.message);
            } else {
                dispatch(signoutSuccess());
            }
        } catch (error) {
            console.log(error.message);
        };
    };

    return (
        <div className='max-w-lg mx-auto p-3 w-full'>
            <h1 className='my-7 text-center font-semibold text-3xl'>Profile</h1>
            <form className='flex flex-col gap-4' onSubmit={handelSubmit}>
                <input type="file" accept='image/*' onChange={handleImageChange} ref={filePickerRef} hidden />
                <div
                    onClick={() => filePickerRef.current.click()}
                    className='w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full relative'>
                    {
                        imageFileUploadProgress && (
                            <CircularProgressbar
                                value={imageFileUploadProgress || 0}
                                text={`${imageFileUploadProgress}%`}
                                strokeWidth={5}
                                styles={{
                                    root: {
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                    },
                                    path: {
                                        stroke: `rgba(62,152,199, ${imageFileUploadProgress / 100})`
                                    }
                                }}
                            />
                        )
                    }
                    <img
                        src={imageFileUrl || currentUser.profilePicture}
                        alt="user profile image"
                        className={`rounded-full w-full h-full object-cover border-8 border-[lightgray]
                        ${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60'}`}
                    />
                </div>
                {
                    imageFileUploadError && <Alert color='failure'> {imageFileUploadError}</Alert>
                }
                <TextInput
                    type='text'
                    id='username'
                    placeholder='Username'
                    defaultValue={currentUser.username}
                    onChange={handelChange}
                />
                <TextInput
                    type='email'
                    id='email'
                    placeholder='Email'
                    defaultValue={currentUser.email}
                    onChange={handelChange}
                />
                <TextInput
                    type='password'
                    id='password'
                    placeholder='Password'
                    onChange={handelChange}
                />
                <Button type='submit' gradientDuoTone='purpleToBlue' outline>
                    Update
                </Button>
            </form>
            <div className='text-red-500 flex justify-between mt-5'>
                <span onClick={() => setShowModal(true)} className='cursor-pointer'>Delete Account</span>
                <span onClick={handelSignout} className='cursor-pointer'>Sign Out</span>
            </div>
            {
                updateUserSuccess && (
                    <Alert className='mt-5' color='success' icon={HiInformationCircle}>{updateUserSuccess}</Alert>
                )
            }
            {
                updateUserError && (
                    <Alert className='mt-5' color='failure' icon={HiInformationCircle}>{updateUserError}</Alert>
                )
            }
            {
                error && (
                    <Alert className='mt-5' color='failure' icon={HiInformationCircle}>{error}</Alert>
                )
            }

            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                popup
                size='md'
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiInformationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
                            Are you sure you want to delete your account?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button color='failure' onClick={handelDeleteUser}>
                                Yes, I'm sure
                            </Button>
                            <Button color='gray' onClick={() => showModal(false)}>
                                No, cancel
                            </Button>
                        </div>
                    </div>
                </Modal.Body>

            </Modal>
        </div>
    )
};

export default DashProfile;
