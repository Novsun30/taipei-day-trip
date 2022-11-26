function addData(data, dataStart, dataEnd){
    let dataIndex = 0;
    for(let i = dataStart; i < dataEnd; i++){
        let sectionContainer = document.querySelector("section.main-content-container");
        let newAttractionContainer = document.createElement("div");
        newAttractionContainer.classList.add("attraction-container");
        sectionContainer.appendChild(newAttractionContainer);
        let newAttractionTitle = document.createElement("div");
        let newAttractionDetail = document.createElement("div");
        newAttractionTitle.classList.add("attraction-title");
        newAttractionDetail.classList.add("attraction-detail");
        let attractionContainer = document.querySelectorAll("div.attraction-container");
        attractionContainer[i].appendChild(newAttractionTitle);
        attractionContainer[i].appendChild(newAttractionDetail);
        let newAttractionNameContainer = document.createElement("div");
        let newAttractionImage = document.createElement("img");
        let attractionTitle = document.querySelectorAll("div.attraction-title");
        newAttractionNameContainer.classList.add("attraction-name-container");
        newAttractionImage.classList.add("attraction-image");
        newAttractionImage.src = data[dataIndex]["images"][0];
        attractionTitle[i].appendChild(newAttractionImage);
        attractionTitle[i].appendChild(newAttractionNameContainer);
        let newAttractionName = document.createElement("p");
        let attractionNameConainer = document.querySelectorAll("div.attraction-name-container")
        newAttractionName.classList.add("attraction-name", "body-bold");
        newAttractionName.innerText = data[dataIndex]["name"];
        attractionNameConainer[i].appendChild(newAttractionName);
        let newAttractionMrt = document.createElement("p");
        let newAttractionCategory = document.createElement("p");
        let attractionDetail = document.querySelectorAll("div.attraction-detail");
        newAttractionMrt.classList.add("attraction-mrt", "body-med");
        newAttractionMrt.innerText = data[dataIndex]["mrt"];
        newAttractionCategory.classList.add("attraction-category", "body-med");
        newAttractionCategory.innerText = data[dataIndex]["category"];
        attractionDetail[i].appendChild(newAttractionMrt);
        attractionDetail[i].appendChild(newAttractionCategory);
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

async function showData(){
    page = await getData(url, page, keyword)
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
        await showData();
        loadStatus = false;
}}

function searchAttraction(){
    let sectionContainer = document.querySelector("section.main-content-container");
    sectionContainer.replaceChildren();   
    page = 0;
    let input = document.querySelector("input.search-input");
    let inputValue = input.value;
    keyword = `&keyword=${inputValue}`
    if (inputValue == ""){
        keyword = "";
    }
    showData();
    window.addEventListener("scroll", throttle, {passive: true});
}

function showCategoryMenu(){
    let categoryMenu = document.querySelector("div.category-menu");
    categoryMenu.style.display = "flex";
    document.addEventListener("click",(e)=>{
        if(e.target.className != "category-menu" && e.target.className != "body-bold search-input"){
            categoryMenu.style.display = "none"
        }
    })
}

async function getCategories(){
    let response = await fetch("http://52.69.110.95:3000/api/categories");
    let data = await response.json();
    data = data["data"];
    for(let i=0;i < data.length; i++){
        let categoryMenu = document.querySelector("div.category-menu");
        let category = document.createElement("p");
        category.classList.add("category", "category-list");
        category.textContent = data[i];
        categoryMenu.appendChild(category);
        category.addEventListener("click",()=>{
            let input = document.querySelector("input.search-input");
            input.value = data[i];
            categoryMenu.style.display = "none";
        });
    }
    let categoryMenu = document.querySelector("div.category-menu");
    categoryMenu.style.display = "none";
}

let page = 0;
let keyword = "";
let loadStatus = false;
let url = "http://52.69.110.95:3000/api/attractions?page=";
showData();
getCategories();
let footer = document.getElementById("scroll-bottom-detector");
window.addEventListener("scroll", throttle, {passive: true});
let searchButton = document.querySelector("button.search-submit");
searchButton.addEventListener("click", searchAttraction);
let searchInput = document.querySelector("input.search-input");
searchInput.addEventListener("focus", showCategoryMenu);