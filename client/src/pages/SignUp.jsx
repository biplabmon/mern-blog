import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiInformationCircle } from 'react-icons/hi'
import OAuth from '../components/OAuth';


const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handelChange = e => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value.trim()
    });
  };

  const handelSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage("Please fill out all the fields.")
    };

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success === false) {
        return setErrorMessage(data.message);
      };

      setLoading(false);
      if(res.ok){
        navigate('/sign-in');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen mt-20'>
      <div className="flex max-w-3xl p-3 mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link
            to='/'
            className='font-bold dark:text-white text-4xl'>
            <span
              className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              Biplab's
            </span>
            Blog
          </Link>
          <p className="text-sm mt-5">
            This is a demo Project. You can sign up with your email and password or with Google.
          </p>
        </div>

        {/* right */}
        <div className="flex-1">
          <form className='flex flex-col gap-4' onSubmit={handelSubmit}>
            <div>
              <Label value='Your username' />
              <TextInput type='text' placeholder='Username' id='username' onChange={handelChange} />
            </div>
            <div>
              <Label value='Your email' />
              <TextInput type='email' placeholder='name@company.com' id='email' onChange={handelChange} />
            </div>
            <div>
              <Label value='Your password' />
              <TextInput type='password' placeholder='Password' id='password' onChange={handelChange} />
            </div>

            <Button gradientDuoTone='purpleToPink' type='submit' disabled={loading}>
              {
                loading ? (
                  <>
                    <Spinner size='sm' />
                    <span className='pl-3'>Loading...</span>
                  </>
                ) : "Sign Up"
              }
            </Button>
            <OAuth />
          </form>
          <div className='flex gap-2 text-sm mt-5'>
            <span>Have an account?</span>
            <Link to='/sign-in' className='text-blue-500'>Sign In</Link>
          </div>
          {
            errorMessage && (
              <Alert className='mt-5' color='failure' icon={HiInformationCircle}>{errorMessage}</Alert>
            )
          }
        </div>
      </div>
    </div>
  )
};

export default SignUp