import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5kue2Zb0kEXrYycOUm_dvhDqyJNWh3PQ",
  authDomain: "final-51736.firebaseapp.com",
  projectId: "final-51736",
  storageBucket: "final-51736.firebasestorage.app",
  messagingSenderId: "165414067534",
  appId: "1:165414067534:web:12d78712d55e8e7299121f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function EventCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [user, setUser] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const docRef = doc(db, "events", "bookings");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setEvents(docSnap.data());
    }
  };

  const addEvent = async () => {
    if (user) {
      const updatedEvents = { ...events };
      selectedDates.forEach(date => {
        updatedEvents[date.toDateString()] = "예약"; // 선택된 모든 날짜에 대해 예약 상태 추가
      });
      setEvents(updatedEvents);
      await setDoc(doc(db, "events", "bookings"), updatedEvents);
    }
  };

  const removeEvent = async () => {
    if (user) {
      const updatedEvents = { ...events };
      selectedDates.forEach(date => {
        delete updatedEvents[date.toDateString()]; // 선택된 날짜들에서 예약 상태 삭제
      });
      setEvents(updatedEvents);
      await setDoc(doc(db, "events", "bookings"), updatedEvents);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("로그인 오류:", error);
    }
  };

  const tileContent = ({ date, view }) => {
    const dateString = date.toDateString();
    if (events[dateString]) {
      return <p className="text-red-500 text-xs">예약</p>; // 예약 상태 변경
    }
  };

  // 날짜 선택 처리: 여러 날짜 선택 가능하게
  const onDateChange = (newDate) => {
    // 하나의 날짜가 선택되면 배열에 추가
    if (!selectedDates.some(d => d.toDateString() === newDate.toDateString())) {
      setSelectedDates([...selectedDates, newDate]);
    } else {
      // 이미 선택된 날짜는 배열에서 제거
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== newDate.toDateString()));
    }
    setDate(newDate);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">숙박 예약 캘린더</h1>
      <Calendar
        onChange={onDateChange}
        value={date}
        tileContent={tileContent} // 예약 상태 표시
        selectRange={false} // 여러 날짜 선택 가능하게 설정
      />
      <div className="mt-4">
        <p className="font-semibold">선택한 날짜: {selectedDates.map(d => d.toDateString()).join(", ")}</p>
        {user ? (
          <>
            <button
              onClick={addEvent}
              className="mt-2 bg-blue-500 text-white p-2 w-full"
            >
              예약으로 설정
            </button>
            <button
              onClick={removeEvent}
              className="mt-2 bg-red-500 text-white p-2 w-full"
            >
              예약 취소
            </button>
          </>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="mt-2 bg-blue-500 text-white p-2 w-full"
          >
            Google로 로그인
          </button>
        )}
      </div>
      {selectedDates.length > 0 && (
        <p className="mt-4 font-semibold text-red-500">
          📌 선택된 날짜: {selectedDates.map(d => d.toDateString()).join(", ")}
        </p>
      )}
    </div>
  );
}