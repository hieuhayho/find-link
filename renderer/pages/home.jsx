import electron from 'electron';
import React, {useState} from 'react';
import Head from 'next/head';

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
    const [allLink, setAllLink] = React.useState('');
    const [allLinkClone, setAllLinkClone] = React.useState('');
    const [allEmail, setAllEmail] = React.useState('');
    const [allNumberPhone, setAllPhone] = React.useState('');
    const [valueURL, setValue] = React.useState('');
    const [totalLink, setTotalLink] = React.useState('0');
    const [totalEmail, setTotalEmail] = React.useState('0');
    const [totalPhone, setTotalPhone] = React.useState('0');

    if (ipcRenderer) {
    }

    function loading(b) {
        if (b) {
            document.getElementById('btn-search').style.display = 'none';
            document.getElementById('btn-loading').style.display = 'block';
        } else {
            document.getElementById('btn-search').style.display = 'block';
            document.getElementById('btn-loading').style.display = 'none';
        }
    }

    function replaceSpecialString(original) {
        let target = original;
        target = target.replace('"', '');
        target = target.replace('\'', '');
        target = target.replace('\\', '');
        return target;
    }

    function decodeHtmlData(html) {
        html = html.replace(/&amp;/g, '&');
        html = html.replace(/&gt;/g, '>');
        html = html.replace(/&lt;/g, '<');
        html = html.replace(/&quot;/g, '"');
        html = html.replace(/'&#39;/g, '\'');
        return html;
    }

    const findUrl = () => {
        let url = valueURL;
        if (!url.includes('https') && !url.includes('http')) {
            url = 'https://' + valueURL;
        }
        loading(true);
        ipcRenderer.send('find-url', {url: url});
    };

    function showAllData() {
        setAllLink(allLinkClone);
    }

    function filterData() {
        let urlSearch = '';
        if (valueURL.includes('/')) {
            urlSearch = valueURL.split('/')[2];
        } else {
            urlSearch = valueURL;
        }
        let newValue = '';
        let splitAllLink = allLinkClone.split('\n\n');
        for (let i = 0; i < splitAllLink.length; i++) {
           if (!splitAllLink[i].includes(urlSearch)) {
               newValue += splitAllLink[i] + '\n\n';
           }
        }
        setAllLink(newValue);
    };

    React.useEffect(() => {
        ipcRenderer.on('find-url', (event, data) => {
            data = decodeHtmlData(data);
            let listEmail = new Array();
            let listPhone = new Array();
            //regex link
            let allUrl = '';
            let regexUrl = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            let matches = data.match(regexUrl);
            if (matches && matches.length > 0) {
                for (let i = 0; i < matches.length; i++) {
                    allUrl += replaceSpecialString(matches[i]) + '\n\n';
                    setTotalLink(i+1);
                }
            }
            setAllLink(allUrl);
            setAllLinkClone(allUrl);
            //done regex link

            //regex email
            let allMail = '';
            let regexEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;
            let matchesEmail = data.match(regexEmail);
            if (matchesEmail && matchesEmail.length > 0) {
                for (let i = 0; i < matchesEmail.length; i++) {
                    let indexOfEmail = listEmail.map(function (x) {
                        return x;
                    }).indexOf(matchesEmail[i]);
                    if (indexOfEmail === -1) {
                        allMail += replaceSpecialString(matchesEmail[i]) + '\n\n';
                        listEmail.push(matchesEmail[i]);
                        setTotalEmail(i+1);
                    }
                }
            }
            setAllEmail(allMail);
            //done regex email

            //regex phone
            let allPhone = '';
            let regexPhone = /(84|0[3|5|7|8|9])+([0-9]{8,9})\b/g;
            let matchesPhone = data.match(regexPhone);
            if (matchesPhone && matchesPhone.length > 0) {
                for (let i = 0; i < matchesPhone.length; i++) {
                    let indexOfPhone = listPhone.map(function (x) {
                        return x;
                    }).indexOf(matchesPhone[i]);
                    if (indexOfPhone === -1) {
                        allPhone += replaceSpecialString(matchesPhone[i]) + '\n\n';
                        listPhone.push(matchesPhone[i]);
                        setTotalPhone(i+1);
                    }
                }
            }
            setAllPhone(allPhone);
            //done regex phone
            loading(false);
        });

        return () => {
            ipcRenderer.removeAllListeners('find-url');
        };
    }, []);

    return (
        <React.Fragment>
            <Head>
                <title>Auto Find Link</title>
            </Head>
            <div className="div-search">
                <input className="input-search" placeholder="Nhập Link" defaultValue={valueURL} onChange={e => { setValue(e.currentTarget.value);}} type="text"/>
                <button className="btn-search" id="btn-search" onClick={findUrl}><img class="icon" src="/images/magnifying-glass.png"/></button>
                <button className="btn-search" id="btn-loading"><img class="icon" src="/images/loading-buffering.gif"/></button>
                <button className="btn-filter" onClick={filterData}>Chỉ lấy liên kết ngoài</button>
                <button className="btn-show" onClick={showAllData}>Hiển thị tất cả</button>
                <a className="a-total">Link: {totalLink}</a> <a className="a-total">Email: {totalEmail}</a> <a className="a-total">Phone: {totalPhone}</a>
            </div>
            <div className="div-data">
                <a className="title-data">Link</a>
                <textarea className="text-area-value" defaultValue={allLink}/>
                <a className="title-data">Email</a>
                <textarea className="text-area-value" defaultValue={allEmail}/>
                <a className="title-data">Phone</a>
                <textarea className="text-area-value" defaultValue={allNumberPhone}/>
            </div>
            <p className="p-bottom">Code by <a target="_blank" href="https://hieuhayho.com">hieuhayho</a> - ATPDev</p>
        </React.Fragment>
    );
};

export default Home;
