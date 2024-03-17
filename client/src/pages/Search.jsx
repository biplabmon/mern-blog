import { Button, Select, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";

const Search = () => {
  const [sidebarDate, setSidebarDate] = useState({
    searchTerm: "",
    sort: "desc",
    category: "uncategorized",
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");

    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarDate({
        ...sidebarDate,
        searchTerm: searchTermFromUrl,
        sort: sortFromUrl,
        category: categoryFromUrl,
      });
    }

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();

      const res = await fetch(`/api/post/getposts?${searchQuery}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }

      if (res.ok) {
        setLoading(false);
        const data = await res.json();
        setPosts(data.posts);
        if (data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      }
    };

    fetchPosts();
  }, [location.search]);

  const handelChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSidebarDate({ ...sidebarDate, searchTerm: e.target.value });
    }
    if (e.target.id === "sort") {
      const order = e.target.value || "desc";
      setSidebarDate({ ...sidebarDate, sort: order });
    }
    if (e.target.id === "category") {
      const category = e.target.value || "uncategorized";
      setSidebarDate({ ...sidebarDate, category: category });
    }
  };

  const handelSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", sidebarDate.searchTerm);
    urlParams.set("sort", sidebarDate.sort);
    urlParams.set("category", sidebarDate.category);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handelShowMOre = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/post/getPosts?${searchQuery}`);
    if (!res.ok) {
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setPosts([...posts, ...data.posts]);
      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
  };

  return (
    <div className=" flex flex-col md:flex-row">
      <div className=" p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form onSubmit={handelSubmit} className=" flex flex-col gap-8">
          <div className=" flex items-center gap-2">
            <label className=" whitespace-nowrap font-semibold">
              Search Term:
            </label>
            <TextInput
              placeholder="Search..."
              id="searchTerm"
              type="text"
              value={sidebarDate.searchTerm}
              onChange={handelChange}
            />
          </div>

          <div className=" flex items-center gap-2">
            <label className=" font-semibold">Sort:</label>
            <Select onChange={handelChange} value={sidebarDate.sort} id="sort">
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>

          <div className=" flex items-center gap-2">
            <label className=" font-semibold">Category:</label>
            <Select
              onChange={handelChange}
              value={sidebarDate.category}
              id="category"
            >
              <option value="uncategorized">Uncategorized</option>
              <option value="reactjs">React.js</option>
              <option value="nextjs">Next.Js</option>
              <option value="javascript">Javascript</option>
            </Select>
          </div>
          <Button type="submit" outline gradientDuoTone="purpleToPink">
            Apply Filters
          </Button>
        </form>
      </div>
      <div className=" w-full">
        <h1 className=" text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">
          Posts results:
        </h1>
        <div className=" p-7 flex flex-wrap gap-4">
          {!loading && posts.length === 0 && (
            <p className=" text-xl text-gray-500">No posts found.</p>
          )}
          {loading && <p className=" text-xl text-gray-500">LOading...</p>}
          {!loading &&
            posts &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
          {showMore && (
            <button
              onClick={handelShowMOre}
              className=" text-teal-500 text-lg hover:underline p-7 w-full"
            >
              show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
