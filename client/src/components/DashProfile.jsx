import { Alert, Button, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateStart, updateSuccess, updateFailure } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { HiInformationCircle } from 'react-icons/hi';


const DashProfile = () => {
    const { currentUser } = useSelector(state => state.user);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
    const [imageFileUploadError, setImageFileUploadError] = useState(null);
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);
    const [formData, setFormData] = useState({});
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

        if(imageFileUploading){
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
                <span className='cursor-pointer'>Delete Account</span>
                <span className='cursor-pointer'>Sign Out</span>
            </div>
            {
                updateUserSuccess &&
                <Alert className='mt-5' color='success' icon={HiInformationCircle}>{updateUserSuccess}</Alert>
            }
            {
                updateUserError &&
                <Alert className='mt-5' color='failure' icon={HiInformationCircle}>{updateUserError}</Alert>
            }
        </div>
    )
};

export default DashProfile;
