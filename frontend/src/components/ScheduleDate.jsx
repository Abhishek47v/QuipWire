import { useState } from "react";
import { Flex, Input, Button } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useShowToast } from "../hooks/useShowToast";


const ScheduleDate = () => {
  const { userId } = useParams();
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [messageText, setMessageText] = useState("");
  const showToast = useShowToast();
  const navigate = useNavigate();


  const handleGoBack =()=> {
    navigate(-1);
  }

  const handleSchedule = async () => {
    try {
      const res = await fetch('/api/messages', {
        method:"POST",
        headers:{
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          recipientId: userId,
          message: messageText,
          date: scheduledDate,
          time: scheduledTime,
          isScheduled: true
        })
      });
      const data = await res.json();
      if(data.error){
        showToast("Error", data.error, "error");
        return;
      }
      setScheduledDate("");
      setScheduledTime("");
      setMessageText("");
      // console.log("Message Scheduled:", data);
      // navigate(`/chat`);
    } catch (err) {
      showToast("Error", err.message, "error");
    }
  };

  return (
    <Flex direction="column" gap={4} alignItems="center" justifyContent="center" mt={10}>
      <Input 
        type="date" 
        placeholder="Select Date" 
        value={scheduledDate} 
        onChange={(e) => setScheduledDate(e.target.value)} 
      />
      <Input 
        type="time" 
        placeholder="Select Time" 
        value={scheduledTime} 
        onChange={(e) => setScheduledTime(e.target.value)} 
      />
      <Input 
        placeholder="Enter message" 
        value={messageText} 
        onChange={(e) => setMessageText(e.target.value)} 
      />
      <Button onClick={handleSchedule}>Schedule</Button>
      <Button onClick={handleGoBack}>Back to Chat</Button>
    </Flex>
  );
};

export default ScheduleDate;
