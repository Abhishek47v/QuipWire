import { useState } from "react"
import { useShowToast } from "./useShowToast";

const usePreviewImage = () => {
    const [imgUrl, setImgurl] = useState(null);
    const showToast = useShowToast();
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(file && file.type.startsWith("image/")){
            const reader = new FileReader();

            reader.onloadend =()=>{
                setImgurl(reader.result);
            };
            
            reader.readAsDataURL(file);
        } else{
            showToast("Invalid file Type", "Select an image file", "error");
            setImgurl(null);
        }
    };
    return {handleImageChange, imgUrl, setImgurl};
};

export default usePreviewImage;