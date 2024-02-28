import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase/';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';


const UpdatePost = () => {
    const { currentUser } = useSelector((state) => state.user);

    const [content, setContent] =useState('');
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        // _id: '',
        // userId: '',
        // slug: '',
        // title: '',
        // description: '',
        content: content,
        // image: '',
        // createdAt: '',
        // updatedAt: '',
    });
    const [imageUploadProgress, setImageUploadProgress] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [publishError, setPublishError] = useState(null);

    const navigate = useNavigate();
    const { postId } = useParams();


    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/post/getposts?postId=${postId}`);
                const data = await res.json();
    
                if (!res.ok) {
                    console.log(data.message);
                    setPublishError(data.message);
                    return;
                };
                if (res.ok) {
                    setPublishError(null);
                    setContent(data.posts[0].content);
                    setFormData(data.posts[0]);
                };
            } catch (error) {
                console.log(error.message);
            }
        };
        
        fetchPost();
    }, [postId]);
    

    const handelUploadImage = async () => {
        try {
            if (!file) {
                setImageUploadError('Please select a image');
                return;
            };
            setImageUploadError(null);
            const storage = getStorage(app);
            const fileName = new Date().getTime() + '-' + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on(
                'state_changed',
                (snapshop) => {
                    const progress = (snapshop.bytesTransferred / snapshop.totalBytes) * 100;
                    setImageUploadProgress(progress);
                },
                (error) => {
                    setImageUploadError("Image upload failed");
                    setImageUploadProgress(null);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setImageUploadProgress(null);
                        setImageUploadError(null);
                        setFormData({ ...formData, image: downloadURL });
                    })
                }
            )
        } catch (error) {
            setImageUploadError("Image upload failed");
            setImageUploadProgress(null);
            console.log(error);
        }
    };

    const hanelContentUpdate = value => {
        setContent(value);
        setFormData({...formData, content: value });
    };

    const handelSubmit = async (event) => {
        event.preventDefault();
        console.log("submit form handler", formData);

        try {
            const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) {
                setPublishError(data.message);
                return;
            };
            if (res.ok) {
                setPublishError(null);
                navigate(`/post/${data.slug}`);
            };
        } catch (error) {
            setPublishError("Something went wrong")
        };
    };

    return (
        <div className='p-3 max-w-3xl mx-auto min-h-screen'>
            <h1 className='text-center text-3xl my-7 font-semibold'>Update post</h1>
            <form className='flex flex-col gap-4' onSubmit={handelSubmit}>
                <div className="flex flex-col gap-4 sm:flex-row justify-between">
                    <TextInput
                        type='text'
                        placeholder='Title'
                        required 
                        id='title'
                        className='flex-1'
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        value={formData.title}
                    />
                    <Select
                        onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                        }
                        value={formData.category}
                    >
                        <option value="uncategorized">Select a category</option>
                        <option value="javascript">JavaScript</option>
                        <option value="nextjs">Next.js</option>
                        <option value="nodejs">Node.js</option>
                    </Select>
                </div>
                <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
                    <FileInput
                        type='file'
                        accept='image/*'
                        onChange={(e) => { setFile(e.target.files[0]) }}
                    />
                    <Button
                        type='button'
                        gradientDuoTone='purpleToBlue'
                        size='sm'
                        outline
                        onClick={handelUploadImage}
                        disabled={imageUploadProgress}
                    >
                        {
                            imageUploadProgress ?
                                <div className='w-16 h-16'>
                                    <CircularProgressbar
                                        value={imageUploadProgress}
                                        text={`${imageUploadProgress || 0} %`} />
                                </div>
                                : "Upload image"
                        }
                    </Button>
                </div>
                {imageUploadError && <Alert color='failure' >{imageUploadError}</Alert>}
                {
                    formData.image && (
                        <img src={formData.image} alt='post image' className='w-full h-72 object-cover' />
                    )
                }
                <ReactQuill
                    theme='snow'
                    value={content}
                    placeholder='Write something...'
                    required
                    className='h-72 mb-12'
                    onChange={hanelContentUpdate}
                />
                <Button type='submit' gradientDuoTone='purpleToPink'>Update post</Button>
                {
                    publishError && <Alert color='failure' className='mt-5' >{publishError}</Alert>
                }
            </form>
        </div>
    )
}

export default UpdatePost;