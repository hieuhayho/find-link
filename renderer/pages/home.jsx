import electron from 'electron';
import React, {useState} from 'react';
import Head from 'next/head';

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
    const [allLink, setAllLink] = React.useState('');
    const [allLinkClone, setAllLinkClone] = React.useState('');
    const [valueURL, setValue] = React.useState('');
    const [totalLink, setTotalLink] = React.useState('0');

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
            let allUrl = '';
            let regexUrl = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            let matches = data.match(regexUrl);
            if (matches.length > 0) {
                for (let i = 0; i < matches.length; i++) {
                    allUrl += replaceSpecialString(matches[i]) + '\n\n';
                    setTotalLink(i+1);
                }
            }
            setAllLink(allUrl);
            setAllLinkClone(allUrl);
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
                <a className="a-total">LINK TÌM ĐƯỢC: {totalLink}</a>
            </div>
            <div>
                <textarea className="text-area-value" defaultValue={allLink}/>
            </div>
            <p className="p-bottom">Code by <a target="_blank" href="https://hieuhayho.com">hieuhayho</a> - ATPDev</p>
        </React.Fragment>
    );
};

export default Home;
