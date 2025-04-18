import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useShowToast } from "../hooks/useShowToast";
import { useState, useEffect } from "react";
import Post from "../components/Post";
import postsAtom from "../atoms/postsAtom";
import { useRecoilState } from "recoil";
import SuggestedUsers from "../components/SuggestedUsers.jsx";

const HomePage = () =>{
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [loading, setLoading] = useState(true);
    const showToast = useShowToast();

    useEffect(()=>{
        const getFeedPosts  = async()=>{
            setLoading(true);
            setPosts([]);
            try{
                const res = await fetch("/api/posts/feed");
                const data = await res.json();
                if(data.error){
                    showToast("Error", data.error, "error");
                    return;
                }
                console.log(data);
                setPosts(data);
            } catch(err){
                showToast("Error", err.message,"error");
            } finally{
                setLoading(false);
            }
        }
        getFeedPosts();
    },[showToast, setPosts]);

    return (
        <Flex gap='10' alignItems={"flex-start"}>
			<Box flex={70}>
				{!loading && posts.length === 0 && <h1>Follow some users to see the feed</h1>}
				{loading && (
					<Flex justify='center'>
						<Spinner size='xl' />
					</Flex>
				)}
				{posts.map((post) => (
					<Post key={post._id} post={post} postedBy={post.postedBy} />
				))}
			</Box>
			<Box flex={30} display={{ base: "none", md: "block"}}>
				<SuggestedUsers />
			</Box>
		</Flex>
    )
}

export default HomePage;