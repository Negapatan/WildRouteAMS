const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteAuthUser = functions.https.onCall(async (data, context) => {
  // Check if request is made by an admin
  const callerUid = context.auth.uid;
  const callerRef = admin.firestore().collection('users').doc(callerUid);
  const caller = await callerRef.get();
  
  if (!caller.exists || caller.data().role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can delete users.'
    );
  }

  try {
    // Delete the user from Authentication
    await admin.auth().deleteUser(data.uid);
    return { success: true };
  } catch (error) {
    console.error('Error deleting auth user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error deleting user from authentication.'
    );
  }
}); 