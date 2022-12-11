function addData(data, dataStart, dataEnd){
    let dataIndex = 0;
    for(let i = dataStart; i < dataEnd; i++){
        const id = data[dataIndex]["id"];
        const attractionUrl = `/attraction/${id}`;
        const sectionContainer = document.querySelector("section.main-content-container");
        const newAnchorTag = document.createElement("a");
        newAnchorTag.href = attractionUrl;
        sectionContainer.appendChild(newAnchorTag); 
        
        const newAttractionContainer = document.createElement("div");
        const newFilterDiv = document.createElement("div");
        newAttractionContainer.classList.add("attraction-container");
        newFilterDiv.classList.add("filter");
        newAnchorTag.appendChild(newAttractionContainer);
        newAttractionContainer.appendChild(newFilterDiv);

        const newAttractionTitle = document.createElement("div");
        const newAttractionDetail = document.createElement("div");
        newAttractionTitle.classList.add("attraction-title");
        newAttractionDetail.classList.add("attraction-detail");
        newAttractionContainer.appendChild(newAttractionTitle);
        newAttractionContainer.appendChild(newAttractionDetail);
        
        const newAttractionNameContainer = document.createElement("div");
        const newAttractionImage = document.createElement("img");
        newAttractionNameContainer.classList.add("attraction-name-container");
        newAttractionImage.classList.add("attraction-image");
        newAttractionImage.src = data[dataIndex]["images"][0];
        newAttractionTitle.appendChild(newAttractionImage);
        newAttractionTitle.appendChild(newAttractionNameContainer);

        const newAttractionName = document.createElement("p");
        newAttractionName.classList.add("attraction-name", "body-bold");
        newAttractionName.innerText = data[dataIndex]["name"];
        newAttractionNameContainer.appendChild(newAttractionName);

        const newAttractionMrt = document.createElement("p");
        const newAttractionCategory = document.createElement("p");
        newAttractionMrt.classList.add("attraction-mrt", "body-med");
        newAttractionMrt.innerText = data[dataIndex]["mrt"];
        newAttractionCategory.classList.add("attraction-category", "body-med");
        newAttractionCategory.innerText = data[dataIndex]["category"];
        newAttractionDetail.appendChild(newAttractionMrt);
        newAttractionDetail.appendChild(newAttractionCategory);
        dataIndex ++;
    }
}

async function getData(url, page, keyword){
    let res = await fetch(url+page+keyword);
    let data = await res.json();
    if (data["data"] == null){
        let sectionContainer = document.querySelector("section.main-content-container");
        let result = document.createElement("h3");
        result.classList.add("bold");
        result.innerText = "查無資料";
        sectionContainer.appendChild(result);
        return;
    }
    let nextPage = data["nextPage"];
    data = data["data"];
    let dataStart = page*12;
    let dataEnd = dataStart+data.length;
    addData(data, dataStart, dataEnd);
    return page = nextPage;
}

async function throttle(){
    if(loadStatus){
        return;
    }
    let bottom = footer.getBoundingClientRect().bottom 
    if (bottom < window.innerHeight+25){
        if (page == null){
            page = 0;
            window.removeEventListener("scroll", throttle, {passive: true})
            return;
        }
        loadStatus = true;
        page = await getData(url, page, keyword);
        loadStatus = false;
}}

async function searchAttraction(){
    let sectionContainer = document.querySelector("section.main-content-container");
    sectionContainer.replaceChildren();   
    page = 0;
    let input = document.querySelector("input.search-input");
    let inputValue = input.value;
    keyword = `&keyword=${inputValue}`
    if (inputValue == ""){
        keyword = "";
    }
    page = await getData(url, page, keyword);
    window.addEventListener("scroll", throttle, {passive: true});
}

function showCategoryMenu(){
    const categoryMenu = document.querySelector("div.category-menu");
    categoryMenu.style.display = "flex";
    document.addEventListener("click",(e)=>{
        if(e.target.className != "category-menu" && e.target.className != "body-bold search-input"){
            categoryMenu.style.display = "none";
        }
    })
}

async function getCategories(){
    const response = await fetch("/api/categories"); 
    let data = await response.json();
    data = data["data"];
    for(let i=0;i < data.length; i++){
        const categoryMenu = document.querySelector("div.category-menu");
        const category = document.createElement("p");
        category.classList.add("category", "category-list");
        category.textContent = data[i];
        categoryMenu.appendChild(category);
        category.addEventListener("click",()=>{
            const input = document.querySelector("input.search-input");
            input.value = data[i];
            categoryMenu.style.display = "none";
        });
    }
    const categoryMenu = document.querySelector("div.category-menu");
    categoryMenu.style.display = "none";
}

let page = 0;
let keyword = "";
let loadStatus = false;
let url = "/api/attractions?page="; 
(async ()=> {page = await getData(url, page, keyword);})();
getCategories();
const footer = document.getElementById("scroll-bottom-detector");
window.addEventListener("scroll", throttle, {passive: true});
const searchButton = document.querySelector("button.search-submit");
searchButton.addEventListener("click", searchAttraction);
const searchInput = document.querySelector("input.search-input");
searchInput.addEventListener("focus", showCategoryMenu);