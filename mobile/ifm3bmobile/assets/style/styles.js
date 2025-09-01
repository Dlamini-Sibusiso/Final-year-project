import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 20,
        flexGrow: 1,
    },
    introcontainer: {
        padding: 20,
        margin: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(1,32,93,0.6)',
    },
    introTitle:{
        color:'white', 
        fontSize: 30,
        textAlign:'center',
        marginBottom: 10,
        textDecorationLine: 'underline',
    },
    label:{
        color:'white', 
        fontSize: 15,
    },
    labelLink:{
        color: 'orange', 
        fontWeight:'bold',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
    textInput: {
        padding: 10,
        backgroundColor:'white',
        borderRadius: 5,
        marginVertical: 10,
    },
    button: {
        backgroundColor: 'orange',
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 10,
        overflow: 'hidden',
        paddingVertical: 7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default styles;