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
    homeTitle:{
        color:'blue', 
        fontSize: 30,
        textAlign:'center',
        marginBottom: 20,
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
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    topButtons: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    topButton: {
        marginBottom: 10,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'flex-start',
    },
    topButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusButton: {
        backgroundColor: '#6c757d',
        padding: 8,
        borderRadius: 5,
        marginRight: 10,
    },
    statusButtonText: {
        color: '#fff',
    },
    listContent: {
        padding: 10,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    field: {
        fontSize: 16,
        marginBottom: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#28a745',
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#555',
        fontSize: 16,
    },
});

export default styles;