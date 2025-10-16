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
    textArea: {
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollView: {
        paddingBottom: 60,
    },
    labelb: {
        fontSize: 14,
        fontWeight: '700',
        color: '#555',
        marginBottom: 5,
    },
    textAreab: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        //backgroundColor: '#fff',
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textInputb: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        //backgroundColor: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 30,
        marginBottom: 10,
        color: '#222',
    },
    header: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
        color: '#333',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderColor: '#333',
        marginRight: 10,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checked: {
        width: 12,
        height: 12,
        backgroundColor: 'green',
        borderRadius: 2,
    },
    checkboxLabel: { fontSize: 16 },
    error: {
        color: 'red',
        backgroundColor: '#ffe6e6',
        padding: 8,
        borderRadius: 6,
        marginBottom: 10,
    },

    containerS: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#f7f9fc' 
    },
    headerS: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    labelS: { fontSize: 16, marginBottom: 5 },
    inputS: {
        borderWidth: 1, borderColor: '#ccc', padding: 10,
        fontSize: 16, borderRadius: 6, backgroundColor: '#fff', marginVertical: 10
    },
    dropdownButton: {
        borderWidth: 1, borderColor: '#ccc', padding: 12,
        borderRadius: 6, backgroundColor: '#fff', marginBottom: 10
    },
    dropdownButtonText: { fontSize: 16, color: '#333' },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center'
    },
    dropdownModal: {
        backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 8, maxHeight: 400
    },
    dropdownOption: {
        padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    addButton: {
        backgroundColor: '#007BFF', padding: 14,
        borderRadius: 6, alignItems: 'center', marginTop: 10
    },
    buttonTextS: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    subHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
    stagingItem: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 10, borderBottomColor: '#ccc', borderBottomWidth: 1
    },
    emptyText: { color: '#888', marginTop: 10, textAlign: 'center' },
    footer: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: 30
    },
    submitBtn: {
        backgroundColor: 'green', padding: 14,
        borderRadius: 6, flex: 1, marginRight: 10, alignItems: 'center'
    },
    cancelBtn: {
        backgroundColor: 'red', padding: 14,
        borderRadius: 6, flex: 1, marginLeft: 10, alignItems: 'center'
    },
    footerBtnText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold' 
    }
});

export default styles;