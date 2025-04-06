import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useShowToast } from './useShowToast';

export const useGetUserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const {username} = useParams();
    const showToast = useShowToast();

    useEffect (() => {
        const getUser = async() => {
            try{
                const res = await fetch(`/api/users/profile/${username}`);
                const data = await res.json();
                if(data.error){
                    showToast("Error", data.error, "error");
                    return;
                }
                if (data.isFrozen) {
					setUser(null);
					return;
				}
                setUser(data);
            } catch(err){
                showToast("Error", err.message, "error");
            } finally{
                setLoading(false);
            }
        };
        getUser();
    }, [username, showToast]);
    return {loading, user};
}


