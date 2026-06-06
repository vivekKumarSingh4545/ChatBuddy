import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInSchema } from "../../utils/validation";
import AuthInput from "./AuthInput";
import { useDispatch, useSelector } from "react-redux";
import PulseLoader from "react-spinners/PulseLoader";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../features/userSlice";
export default function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.user);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signInSchema),
  });
  const onSubmit = async (values) => {
    let res = await dispatch(loginUser({ ...values }));
    console.log(res);
    if (res?.payload?.user) {
      navigate("/");
    }
  };
    return (
      <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative bg-dark_bg_1">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-green_1/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Container */}
        <div className="w-full max-w-md space-y-8 p-8 dark:bg-dark_bg_2/40 backdrop-blur-xl border border-dark_border_1 shadow-[0_8px_32px_0_rgba(99,102,241,0.08)] rounded-2xl z-10">
          {/*Heading*/}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight dark:text-dark_text_1">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm dark:text-dark_text_2">
              Sign in to continue chatting
            </p>
          </div>
          {/*Form*/}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <AuthInput
              name="email"
              type="text"
              placeholder="Email"
              register={register}
              error={errors?.email?.message}
            />
            <AuthInput
              name="password"
              type="password"
              placeholder="Password"
              register={register}
              error={errors?.password?.message}
            />
            {/*if we have an error*/}
            {error ? (
              <div className="text-rose-500 text-xs text-center font-medium bg-rose-500/10 py-2.5 px-3 rounded-lg border border-rose-500/20">
                {error}
              </div>
            ) : null}
            {/*Submit button*/}
            <button
              className="w-full flex justify-center bg-gradient-to-r from-green_1 to-purple-600 hover:from-green_2 hover:to-purple-700 text-slate-50 p-3.5 rounded-xl font-bold transition duration-300 shadow-lg shadow-green_1/10 cursor-pointer active:scale-[0.98] outline-none"
              type="submit"
            >
              {status === "loading" ? (
                <PulseLoader color="#fff" size={10} />
              ) : (
                "Sign In"
              )}
            </button>
            {/* Sign in link */}
            <p className="flex items-center justify-center gap-x-1 mt-6 text-center text-sm dark:text-dark_text_2">
              <span>Don't have an account?</span>
              <Link
                to="/register"
                className="text-green_1 font-semibold hover:underline cursor-pointer transition ease-in duration-200"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
    } 