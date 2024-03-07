import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export interface Blog {
  content: string;
  title: string;
  id: number;
  author: {
    name: string;
  };
}

export const useBlogs = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api.v1/blog/bluk`, {
        headers: {
            Authorization: localStorage.getItem("token")
        }
    })
    .then(response => {
        setBlogs(response.data.blogs);
        setLoading(false);
    })
  }, [])
  return {
    loading,
    blogs
  }
};