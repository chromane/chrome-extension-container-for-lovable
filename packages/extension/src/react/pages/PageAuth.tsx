import ctrl_content from '@src/ts/ctrl_content';
import ctrl_frame from '@src/ts/ctrl_frame';

const PageAuth = () => {
  const sign_in_with_google = async () => {
    ctrl_frame.auth.trigger_sign_in_with_google();
  };
  return (
    <div>
      PageAuth page
      <button onClick={sign_in_with_google}>Sign in With Google</button>
    </div>
  );
};
export default PageAuth;
