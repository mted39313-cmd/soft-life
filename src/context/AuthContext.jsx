import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
// kustore user logins tusisumbuke kutafuta kwa page zingine
const Authcontext = createContext(null)
export function Authprovider ({children}) {
    // ka msee aja login inakua null
    const [user, setUser] = useState(null);
    // inapause app ikiload ndio firebase ione ka kuna msee amekua 
    const [loading, setLoading] =useState(true)
    // kuskiza login changes 
    useEffect(() => {
    // msee akilogin ama out fire base inachangamka kuload ikilia false
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // kusafisha listener component ikidie ama unmount
    return () => unsubscribe();
  }, []);

 //call firebase for signin msee akisubmit   
function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
//google provider inatuletea signup na google  
function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }
//call signout na null after ameshadoo vitu 
  function logout() {
    return signOut(auth);
  }
  const value = {
    user,
    loading,
    loginWithEmail,
    loginWithGoogle,
    logout,
  };
  //Unajua niko protected naeza logiwa out so inamake sure nisifanywe mbaya na sijamada
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
//communication muhimu so lazima tuexport ndio watamcall anytime
export function useAuth() {
  return useContext(AuthContext);
}
    