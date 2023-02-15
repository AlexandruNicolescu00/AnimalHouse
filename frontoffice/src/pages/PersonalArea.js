import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, Outlet, useNavigate } from "react-router-dom";
import personalItems from "./data/personalItems.json";

const PersonalArea = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user.isLogged) navigate("/login");
  }, []);
  if (!user.isLogged) return <></>;
  else
    return (
      <>
        <h1 className="mt-8 text-center font-bold text-3xl tracking-tighter">
          {" "}
          Area utente{" "}
        </h1>
        <h2 className="tracking-wide block text-black text-center text-2xl my-6">
          {" "}
          Bentornato, {user.userInfo.name} 💫{" "}
        </h2>
        <p className="text-black tracking-tighter text-center text-2xl my-6">
          {" "}
          Il tuo abbonamento:{" "}
          {user.userInfo.isVip && (
            <span className="text-yellow-500"> VIP </span>
          )}{" "}
        </p>
        <ul>
          {personalItems.map((item, index) => (
            <li className={`grid grid-cols-8 gap-4 p-2`} key={index}>
              {" "}
              <Link
                className={`text-center border-4 border-black col-span-4 text-xl p-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg`}
                to={item.link}
                style={{
                  gridColumnStart: index + 2,
                }}
              >
                {" "}
                {item.value}{" "}
              </Link>{" "}
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center justify-center mt-12">
          <Outlet />
        </div>
      </>
    );
};

export default PersonalArea;
